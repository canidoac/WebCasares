import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SiteBanner } from "@/components/site-banner"
import { getUser, canManageDiscipline } from "@/lib/auth"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { getActiveBannerForUser } from "@/lib/banners-popups"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import {
  Trophy,
  Users,
  CalendarIcon,
  TrendingUp,
  Newspaper,
  UserCog,
  MapPin,
  Clock,
  Play,
  User as UserIcon,
  UsersRound,
  Settings,
  Pencil,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { ShareButton } from "@/components/share-button"
import { DisciplineStatsSection } from "@/components/discipline-stats-section"
import {
  AddPlayerButton,
  RemovePlayerButton,
  AddStaffButton,
  RemoveStaffButton,
} from "@/components/discipline-inline-actions"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface TrophyItem {
  id: number
  title: string
  year: number
  image_url: string | null
  description: string | null
}

async function getDisciplineBySlug(slug: string) {
  const supabase = await createClient()

  const { data: discipline, error } = await supabase
    .from("Disciplines")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !discipline) {
    return null
  }

  // Obtener torneo activo
  const { data: activeTournament } = await supabase
    .from("Tournaments")
    .select("id, name, last_scraped_at, source_url")
    .eq("discipline_id", discipline.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Obtener lista de torneos
  const { data: tournaments } = await supabase
    .from("Tournaments")
    .select("id, name, year, last_scraped_at")
    .eq("discipline_id", discipline.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Obtener standings del torneo activo
  let standings: any[] = []
  if (activeTournament) {
    const { data: standingsData } = await supabase
      .from("TournamentStandings")
      .select("*")
      .eq("tournament_id", activeTournament.id)
      .order("position", { ascending: true })

    standings = standingsData || []
  }

  // Obtener imagenes
  const { data: images } = await supabase
    .from("DisciplineImages")
    .select("*")
    .eq("discipline_id", discipline.id)
    .order("display_order", { ascending: true })

  // Obtener staff
  const { data: staffData } = await supabase
    .from("DisciplineStaff")
    .select("*")
    .eq("discipline_id", discipline.id)
    .order("display_order", { ascending: true })

  const staff = await Promise.all(
    (staffData || []).map(async (member) => {
      if (member.user_id) {
        const { data: userData } = await supabase
          .from("User")
          .select("id, NOMBRE, APELLIDO, display_name, photo_url, socio_number")
          .eq("id", member.user_id)
          .single()

        return { ...member, user: userData }
      }
      return { ...member, user: null }
    })
  )

  // Obtener jugadores (activos e inactivos)
  const { data: playersData } = await supabase
    .from("DisciplinePlayers")
    .select("*")
    .eq("discipline_id", discipline.id)
    .order("jersey_number", { ascending: true })

  const players = await Promise.all(
    (playersData || []).map(async (player) => {
      const { data: userData } = await supabase
        .from("User")
        .select("id, NOMBRE, APELLIDO, display_name, photo_url, socio_number")
        .eq("id", player.user_id)
        .single()

      return { ...player, user: userData }
    })
  )

  // Obtener noticias relacionadas
  const { data: newsRelations } = await supabase
    .from("NewsDisciplines")
    .select(
      `
      news:News(
        id,
        title,
        description,
        short_description,
        image_url,
        thumbnail_url,
        media_type,
        created_at,
        active
      )
    `
    )
    .eq("discipline_id", discipline.id)
    .order("created_at", { ascending: false })
    .limit(6)

  const relatedNews =
    newsRelations?.map((nr) => nr.news).filter((n) => n && n.active) || []

  // Obtener partidos
  const { data: matches } = await supabase
    .from("Matches")
    .select(
      `
      id,
      match_date,
      match_time,
      rival_team,
      is_home,
      status,
      match_type,
      location:Locations(name, google_maps_url),
      tournament:Tournaments(name),
      result:MatchResults(our_score, rival_score)
    `
    )
    .eq("discipline_id", discipline.id)
    .order("match_date", { ascending: false })
    .limit(30)

  const processedMatches =
    matches?.map((m: any) => ({
      ...m,
      our_score: m.result?.our_score,
      rival_score: m.result?.rival_score,
    })) || []

  // Obtener trofeos
  const { data: trophies } = await supabase
    .from("DisciplineTrophies")
    .select("*")
    .eq("discipline_id", discipline.id)
    .order("year", { ascending: false })

  return {
    ...discipline,
    images: images || [],
    staff: staff || [],
    players: players || [],
    relatedNews,
    activeTournament,
    tournaments: tournaments || [],
    standings,
    matches: processedMatches,
    trophies: trophies || [],
  }
}

export default async function DisciplinaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getUser()
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()
  const activeBanner = await getActiveBannerForUser(user?.id, user?.id_rol)

  const discipline = await getDisciplineBySlug(slug)

  if (!discipline) {
    notFound()
  }

  // Verificar si el usuario puede administrar esta disciplina
  const canManage = user ? await canManageDiscipline(discipline.id) : false

  // Logica para encontrar estadisticas
  const completedMatches =
    discipline.matches?.filter(
      (m: any) => m.status === "completed" || m.our_score !== undefined
    ) || []
  const lastMatch = completedMatches.length > 0 ? completedMatches[0] : null

  const scheduledMatches =
    discipline.matches
      ?.filter(
        (m: any) =>
          m.status === "scheduled" && new Date(m.match_date) >= new Date()
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      ) || []
  const nextMatch = scheduledMatches.length > 0 ? scheduledMatches[0] : null

  // Logica para encontrar posicion actual
  let currentPosition = "-"
  if (discipline.standings && discipline.standings.length > 0) {
    const myTeam = discipline.standings.find(
      (s: any) =>
        s.team_name?.toLowerCase().includes("carlos casares") ||
        s.team_name?.toLowerCase().includes("ccc") ||
        s.team_name?.toLowerCase().includes("club")
    )
    if (myTeam) {
      currentPosition = `${myTeam.position}°`
    }
  }

  const getNewsUrl = (id: number) => {
    if (typeof process.env.NEXT_PUBLIC_APP_URL !== "undefined") {
      return `${process.env.NEXT_PUBLIC_APP_URL}/noticias/${id}`
    }
    return ""
  }

  // Icono de genero
  const GenderIcon = () => {
    if (discipline.gender === "male")
      return <UserIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />
    if (discipline.gender === "female")
      return <UsersRound className="h-8 w-8 md:h-10 md:w-10 text-pink-500" />
    if (discipline.gender === "mixed")
      return <Users className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {activeBanner && (
        <SiteBanner
          text={activeBanner.message}
          link={activeBanner.link_url || undefined}
          buttonText={activeBanner.button_text || "Ir"}
          showButton={activeBanner.show_button && !!activeBanner.link_url}
          color={activeBanner.bg_color_light}
          textColor={activeBanner.text_color_light}
          colorDark={activeBanner.bg_color_dark}
          textColorDark={activeBanner.text_color_dark}
          buttonColor={activeBanner.button_bg_color_light}
          buttonColorDark={activeBanner.button_bg_color_dark}
          buttonTextColor={activeBanner.button_text_color_light}
          buttonTextColorDark={activeBanner.button_text_color_dark}
        />
      )}

      <Navbar user={user} config={config} navbarItems={navbarItems} />

      <main className="flex-1 bg-muted/5">
        {/* Boton flotante de administracion */}
        {canManage && (
          <Link
            href={`/admin/disciplinas/${discipline.id}`}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">Administrar</span>
          </Link>
        )}

        {/* Hero Section */}
        <section className="w-full py-12 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  {discipline.name}
                </h1>
                <GenderIcon />
                {canManage && (
                  <Link 
                    href={`/admin/disciplinas/${discipline.id}?tab=info`}
                    className="rounded-full p-2 bg-muted/50 hover:bg-muted transition-colors"
                    title="Editar informacion"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )}
              </div>
              {discipline.description && (
                <p className="text-xl text-muted-foreground max-w-3xl text-balance">
                  {discipline.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="container px-4 md:px-6 py-8">
          <Tabs defaultValue="info" className="w-full space-y-6">
            <TabsList className="w-full flex h-auto flex-wrap justify-start gap-2 bg-muted p-1 rounded-lg">
              <TabsTrigger
                value="info"
                className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Informacion
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Cronograma
              </TabsTrigger>
              <TabsTrigger
                value="squad"
                className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Users className="mr-2 h-4 w-4" />
                Plantel
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Cuerpo Tecnico
              </TabsTrigger>
              <TabsTrigger
                value="trophies"
                className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Vitrina
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Newspaper className="mr-2 h-4 w-4" />
                Noticias
              </TabsTrigger>
            </TabsList>

            {/* TAB: INFORMACION */}
            <TabsContent value="info" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Posicion
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {currentPosition}
                    </div>
                    <p className="text-xs text-muted-foreground">En la tabla</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Torneo Actual
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-2xl font-bold truncate"
                      title={discipline.activeTournament?.name}
                    >
                      {discipline.activeTournament?.source_url ? (
                        <a
                          href={discipline.activeTournament.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-primary transition-colors"
                        >
                          {discipline.activeTournament?.name ||
                            discipline.current_tournament ||
                            "-"}
                        </a>
                      ) : (
                        discipline.activeTournament?.name ||
                        discipline.current_tournament ||
                        "-"
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Competencia oficial
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Jugadores
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {discipline.players
                        ? discipline.players.filter((p: any) => p.is_active)
                            .length
                        : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      En el plantel actual
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Fundacion
                    </CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {discipline.foundation_year || "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Anio de inicio
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Ultimo Resultado */}
                <Card className="h-full relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {lastMatch && (
                      <ShareButton
                        title={`Resultado: ${lastMatch.is_home ? "Club Carlos Casares" : lastMatch.rival_team} vs ${lastMatch.is_home ? lastMatch.rival_team : "Club Carlos Casares"}`}
                        text={`Resultado del partido: ${lastMatch.is_home ? lastMatch.our_score : lastMatch.rival_score} - ${lastMatch.is_home ? lastMatch.rival_score : lastMatch.our_score}`}
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>Ultimo Resultado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lastMatch ? (
                      <div className="flex flex-col items-center justify-center py-4 space-y-4">
                        <div className="text-sm text-muted-foreground">
                          {new Date(lastMatch.match_date).toLocaleDateString(
                            "es-AR",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            }
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-8 w-full">
                          <div className="text-center flex-1">
                            <div className="font-bold text-lg md:text-xl">
                              {lastMatch.is_home
                                ? "Club Carlos Casares"
                                : lastMatch.rival_team}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 bg-muted px-4 py-2 rounded-lg">
                            <span className="text-3xl font-bold">
                              {lastMatch.is_home
                                ? lastMatch.our_score
                                : lastMatch.rival_score}
                            </span>
                            <span className="text-xl text-muted-foreground">
                              -
                            </span>
                            <span className="text-3xl font-bold">
                              {lastMatch.is_home
                                ? lastMatch.rival_score
                                : lastMatch.our_score}
                            </span>
                          </div>
                          <div className="text-center flex-1">
                            <div className="font-bold text-lg md:text-xl">
                              {lastMatch.is_home
                                ? lastMatch.rival_team
                                : "Club Carlos Casares"}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            lastMatch.our_score > lastMatch.rival_score
                              ? "default"
                              : lastMatch.our_score < lastMatch.rival_score
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {lastMatch.our_score > lastMatch.rival_score
                            ? "Victoria"
                            : lastMatch.our_score < lastMatch.rival_score
                              ? "Derrota"
                              : "Empate"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        No hay resultados recientes
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Proximo Partido */}
                <Card className="h-full relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {nextMatch && (
                      <ShareButton
                        title={`Proximo Partido: Club Carlos Casares vs ${nextMatch.rival_team}`}
                        text={`No te pierdas el proximo partido!\n${new Date(nextMatch.match_date).toLocaleDateString("es-AR")}\n${nextMatch.match_time?.slice(0, 5)} HS\n${nextMatch.location?.name || "A confirmar"}`}
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>Proximo Partido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nextMatch ? (
                      <div className="flex flex-col items-center justify-center py-4 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(nextMatch.match_date).toLocaleDateString(
                            "es-AR",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            }
                          )}
                        </div>
                        <div className="text-3xl font-bold text-center">
                          VS {nextMatch.rival_team}
                        </div>
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {nextMatch.match_time?.slice(0, 5)} HS
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {nextMatch.location?.name || "A confirmar"}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {nextMatch.is_home ? "Local" : "Visitante"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        No hay partidos programados
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Stats Section con tabla de posiciones */}
              <DisciplineStatsSection
                disciplineId={discipline.id}
                tournaments={discipline.tournaments}
                initialTournamentId={discipline.activeTournament?.id}
                initialStandings={discipline.standings}
                initialTopScorers={[]}
                initialMostMatches={[]}
              />
            </TabsContent>

            {/* TAB: CRONOGRAMA */}
            <TabsContent value="schedule" className="space-y-6">
              <ScheduleCalendar
                matches={discipline.matches || []}
                canManageCitations={canManage}
                players={discipline.players}
              />

              {(!discipline.matches || discipline.matches.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No hay partidos registrados en el cronograma.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB: PLANTEL */}
            <TabsContent value="squad">
              {canManage && (
                <div className="flex justify-end mb-4">
                  <AddPlayerButton disciplineId={discipline.id} />
                </div>
              )}
              <Tabs defaultValue="active" className="w-full">
                <div className="flex justify-center mb-6">
                  <TabsList>
                    <TabsTrigger value="active">Plantel Actual</TabsTrigger>
                    <TabsTrigger value="former">Ex Jugadores</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="active">
                  {discipline.players &&
                  discipline.players.filter((p: any) => p.is_active).length >
                    0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {discipline.players
                        .filter((p: any) => p.is_active)
                        .map((player: any) => {
                          const displayName =
                            player.user?.display_name ||
                            `${player.user?.NOMBRE || ""} ${player.user?.APELLIDO || ""}`

                          return (
                            <div key={player.id} className="relative group">
                              {canManage && (
                                <RemovePlayerButton
                                  playerId={player.id}
                                  playerName={displayName}
                                />
                              )}
                              <Link
                                href={player.user?.socio_number ? `/perfil/${player.user.socio_number}` : "#"}
                              >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                  <CardContent className="p-6 flex items-center gap-3">
                                    <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                      {player.user?.photo_url ? (
                                        <Image
                                          src={player.user.photo_url || "/placeholder.svg"}
                                          alt={displayName}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                                          {displayName.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold truncate">
                                        {displayName}
                                      </p>
                                      {player.position && (
                                        <p className="text-sm text-muted-foreground truncate">
                                          {player.position}
                                        </p>
                                      )}
                                      <div className="flex gap-2 mt-2">
                                        {player.jersey_number && (
                                          <Badge variant="outline">
                                            #{player.jersey_number}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center text-muted-foreground">
                        No hay jugadores activos registrados.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="former">
                  {discipline.players &&
                  discipline.players.filter((p: any) => !p.is_active).length >
                    0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {discipline.players
                        .filter((p: any) => !p.is_active)
                        .map((player: any) => {
                          const displayName =
                            player.user?.display_name ||
                            `${player.user?.NOMBRE || ""} ${player.user?.APELLIDO || ""}`

                          return (
                            <div key={player.id} className="relative group">
                              {canManage && (
                                <RemovePlayerButton
                                  playerId={player.id}
                                  playerName={displayName}
                                />
                              )}
                              <Link
                                href={player.user?.socio_number ? `/perfil/${player.user.socio_number}` : "#"}
                              >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full opacity-75 hover:opacity-100">
                                  <CardContent className="p-6 flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                      {player.user?.photo_url ? (
                                        <Image
                                          src={player.user.photo_url || "/placeholder.svg"}
                                          alt={displayName}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                                          {displayName.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-lg">
                                        {displayName}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Ex Jugador
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center text-muted-foreground">
                        No hay ex-jugadores registrados.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* TAB: CUERPO TECNICO */}
            <TabsContent value="staff">
              {canManage && (
                <div className="flex justify-end mb-4">
                  <AddStaffButton disciplineId={discipline.id} />
                </div>
              )}
              {discipline.staff && discipline.staff.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discipline.staff.map((member: any) => {
                    const displayName = member.user
                      ? member.user.display_name ||
                        `${member.user.NOMBRE} ${member.user.APELLIDO}`
                      : member.name

                    const content = (
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          {member.user?.photo_url ? (
                            <Image
                              src={member.user.photo_url || "/placeholder.svg"}
                              alt={displayName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{displayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </CardContent>
                    )

                    const cardWrapper = member.user_id && member.user?.socio_number ? (
                      <Link
                        href={`/perfil/${member.user.socio_number}`}
                      >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                          {content}
                        </Card>
                      </Link>
                    ) : (
                      <Card className="h-full">
                        {content}
                      </Card>
                    )

                    return (
                      <div key={member.id} className="relative group">
                        {canManage && (
                          <RemoveStaffButton
                            staffId={member.id}
                            staffName={displayName}
                          />
                        )}
                        {cardWrapper}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No hay cuerpo tecnico registrado.
                    {canManage && (
                      <div className="mt-4">
                        <AddStaffButton disciplineId={discipline.id} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB: VITRINA */}
            <TabsContent value="trophies" className="space-y-6">
              {canManage && (
                <div className="flex justify-end">
                  <Link
                    href={`/admin/disciplinas/${discipline.id}?tab=trophies`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md border px-3 py-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar Vitrina
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discipline.trophies && discipline.trophies.length > 0 ? (
                  discipline.trophies.map((trophy: TrophyItem) => (
                    <div
                      key={trophy.id}
                      className="group relative overflow-hidden rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="aspect-square relative bg-gradient-to-br from-yellow-500/10 to-orange-500/10 flex items-center justify-center p-8">
                        {trophy.image_url ? (
                          <img
                            src={trophy.image_url || "/placeholder.svg"}
                            alt={trophy.title}
                            className="w-full h-full object-contain drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Trophy className="w-32 h-32 text-yellow-500 drop-shadow-lg" />
                        )}
                        <div className="absolute top-4 right-4 bg-black/80 text-white text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                          {trophy.year}
                        </div>
                      </div>
                      <div className="p-6 text-center">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {trophy.title}
                        </h3>
                        {trophy.description && (
                          <p className="text-muted-foreground text-sm">
                            {trophy.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-muted/30 rounded-xl border border-dashed">
                    <Trophy className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      Aun no hay trofeos en la vitrina
                    </h3>
                    <p className="text-sm text-muted-foreground/70">
                      Pronto llenaremos este espacio de gloria!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB: NOTICIAS */}
            <TabsContent value="news">
              {canManage && (
                <div className="flex justify-end mb-4">
                  <Link
                    href="/admin/noticias"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md border px-3 py-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Gestionar Noticias
                  </Link>
                </div>
              )}
              {discipline.relatedNews && discipline.relatedNews.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discipline.relatedNews.map((news: any) => {
                    const isVideo =
                      news.media_type === "video" ||
                      news.media_type === "youtube"
                    const displayImage =
                      isVideo && news.thumbnail_url
                        ? news.thumbnail_url
                        : news.image_url

                    return (
                      <Card
                        key={news.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group relative"
                      >
                        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ShareButton
                            title={news.title}
                            text={news.short_description || news.description}
                            url={getNewsUrl(news.id)}
                            variant="secondary"
                            className="bg-background/80 backdrop-blur-sm hover:bg-background"
                          />
                        </div>
                        <Link
                          href={`/noticias/${news.id}`}
                          className="flex flex-col h-full"
                        >
                          <div className="relative aspect-video">
                            <Image
                              src={displayImage || "/placeholder.svg"}
                              alt={news.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {isVideo && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                <div className="bg-primary/90 rounded-full p-3 group-hover:scale-110 transition-transform shadow-lg">
                                  <Play className="h-6 w-6 text-primary-foreground fill-current" />
                                </div>
                              </div>
                            )}
                          </div>
                          <CardHeader>
                            <CardTitle className="line-clamp-2">
                              {news.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {news.short_description || news.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">
                              {new Date(news.created_at).toLocaleDateString(
                                "es-AR"
                              )}
                            </p>
                          </CardContent>
                        </Link>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No hay noticias recientes para esta disciplina.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Images Gallery */}
        {discipline.images && discipline.images.length > 0 && (
          <section className="w-full py-12 bg-muted/30">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold mb-6">Galeria</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discipline.images.map((image: any) => (
                  <div
                    key={image.id}
                    className="relative aspect-video rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.caption || discipline.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer user={user} />
    </div>
  )
}
