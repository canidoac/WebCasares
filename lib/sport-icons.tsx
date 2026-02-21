// Google Material Icons disponibles para deportes
// Formato: icon_name -> label para mostrar
export const materialIcons: Record<string, string> = {
  // Deportes principales
  sports_soccer: "Fútbol",
  sports_basketball: "Básquet",
  sports_volleyball: "Voleibol",
  sports_tennis: "Tenis",
  sports_hockey: "Hockey",
  sports_baseball: "Baseball",
  sports_rugby: "Rugby",
  sports_handball: "Handball",
  sports_golf: "Golf",
  sports_cricket: "Cricket",
  sports_kabaddi: "Artes Marciales",
  sports_mma: "MMA",
  sports_motorsports: "Motorsports",
  sports_esports: "E-Sports",
  
  // Actividades
  pool: "Natación",
  directions_run: "Running",
  directions_bike: "Ciclismo",
  fitness_center: "Fitness/Gym",
  rowing: "Remo",
  skateboarding: "Skateboard",
  snowboarding: "Snowboard",
  downhill_skiing: "Ski",
  hiking: "Trekking",
  surfing: "Surf",
  
  // Genéricos
  emoji_events: "Trofeo/Premio",
  military_tech: "Medalla",
  workspace_premium: "Premium",
  star: "Estrella",
  flag: "Bandera",
  timer: "Cronómetro",
  groups: "Equipo",
  person: "Individual",
}

// Lista de iconos para el selector
export const availableIcons = Object.entries(materialIcons).map(([icon, label]) => ({
  icon,
  label
}))

// Función para sugerir un icono basado en el nombre de la disciplina
export function suggestIconForDiscipline(disciplineName: string): string {
  const name = disciplineName.toLowerCase()
  
  if (name.includes("fútbol") || name.includes("futbol") || name.includes("football") || name.includes("soccer")) {
    return "sports_soccer"
  }
  if (name.includes("básquet") || name.includes("basquet") || name.includes("basketball") || name.includes("baloncesto")) {
    return "sports_basketball"
  }
  if (name.includes("voley") || name.includes("vóley") || name.includes("volleyball") || name.includes("voleibol")) {
    return "sports_volleyball"
  }
  if (name.includes("tenis") || name.includes("tennis") || name.includes("pádel") || name.includes("padel")) {
    return "sports_tennis"
  }
  if (name.includes("hockey")) {
    return "sports_hockey"
  }
  if (name.includes("rugby")) {
    return "sports_rugby"
  }
  if (name.includes("handball") || name.includes("balonmano")) {
    return "sports_handball"
  }
  if (name.includes("natación") || name.includes("natacion") || name.includes("swimming") || name.includes("agua")) {
    return "pool"
  }
  if (name.includes("running") || name.includes("atletismo") || name.includes("maratón") || name.includes("maraton") || name.includes("correr")) {
    return "directions_run"
  }
  if (name.includes("ciclismo") || name.includes("cycling") || name.includes("bici")) {
    return "directions_bike"
  }
  if (name.includes("gimnasio") || name.includes("fitness") || name.includes("gym") || name.includes("pesas")) {
    return "fitness_center"
  }
  if (name.includes("golf")) {
    return "sports_golf"
  }
  if (name.includes("esport") || name.includes("gaming") || name.includes("videojuego")) {
    return "sports_esports"
  }
  
  return "sports_soccer"
}

// Función para verificar si es una URL de imagen personalizada
export function isCustomIconUrl(icon: string | null): boolean {
  if (!icon) return false
  return icon.startsWith("http") || icon.startsWith("/")
}

// Componente para renderizar el icono (Material o imagen personalizada)
interface SportIconProps {
  icon: string | null
  className?: string
  size?: number
}

export function SportIcon({ icon, className = "", size = 24 }: SportIconProps) {
  if (!icon) {
    return (
      <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontSize: size }}
      >
        sports_soccer
      </span>
    )
  }

  // Si es una URL, mostrar imagen
  if (isCustomIconUrl(icon)) {
    return (
      <img 
        src={icon} 
        alt="Sport icon" 
        className={className}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    )
  }

  // Material icon
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size }}
    >
      {icon}
    </span>
  )
}

// Función legacy para compatibilidad con código existente
export function getIconComponent(iconName: string | null) {
  // Retorna un componente que renderiza el icono
  return function IconComponent({ className = "w-6 h-6" }: { className?: string }) {
    const size = className.includes("w-3") ? 12 : 
                 className.includes("w-4") ? 16 : 
                 className.includes("w-5") ? 20 : 
                 className.includes("w-7") ? 28 : 24
    return <SportIcon icon={iconName} size={size} className={className.replace(/w-\d+\s*h-\d+/, '')} />
  }
}
