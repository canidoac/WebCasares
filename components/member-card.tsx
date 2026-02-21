"use client"

import { useRef, useState, useEffect } from "react"
import { Download, Share2, User } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface MemberCardProps {
  nombre: string
  apellido: string
  socioNumber: string
  memberCategory: string
  photoUrl?: string | null
  registrationDate: Date
  dni?: string | null
}

const AVES_IMAGE = "/images/aves.png"
const ESCUDO_IMAGE = "/images/escudo-carlos-casares.png"

export function MemberCard({
  nombre,
  apellido,
  socioNumber,
  memberCategory,
  photoUrl,
  registrationDate,
  dni,
}: MemberCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return { day, month, year: String(year) }
  }

  const dateFormatted = formatDate(registrationDate)

  // Efecto 3D Tilt
  useEffect(() => {
    const wrap = tiltRef.current
    const card = cardRef.current
    const glare = glareRef.current
    if (!wrap || !card || !glare) return

    const maxTilt = 10
    const scale = 1.02

    const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

    const setTransform = (rx: number, ry: number, s: number) => {
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
    }

    const setGlare = (px: number, py: number) => {
      glare.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.45), rgba(255,255,255,0) 58%)`
    }

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top

      const nx = (x / r.width) * 2 - 1
      const ny = (y / r.height) * 2 - 1

      const ry = clamp(nx * maxTilt, -maxTilt, maxTilt)
      const rx = clamp(-ny * maxTilt, -maxTilt, maxTilt)

      setTransform(rx, ry, scale)

      const gx = clamp((x / r.width) * 100, 0, 100)
      const gy = clamp((y / r.height) * 100, 0, 100)
      setGlare(gx, gy)
    }

    const onEnter = () => setIsHovering(true)
    const onLeave = () => {
      setIsHovering(false)
      setTransform(0, 0, 1)
      setGlare(30, 20)
    }

    wrap.addEventListener("mouseenter", onEnter)
    wrap.addEventListener("mousemove", onMove)
    wrap.addEventListener("mouseleave", onLeave)

    setGlare(30, 20)

    return () => {
      wrap.removeEventListener("mouseenter", onEnter)
      wrap.removeEventListener("mousemove", onMove)
      wrap.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  const downloadCard = async () => {
    if (!cardRef.current || isGenerating) return
    setIsGenerating(true)

    try {
      const html2canvas = (await import("html2canvas")).default
      cardRef.current.style.transform = 'none'
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const link = document.createElement("a")
      link.download = `carnet-socio-${socioNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Error generando carnet:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const shareCard = async () => {
    if (!cardRef.current || isGenerating) return
    setIsGenerating(true)

    try {
      const html2canvas = (await import("html2canvas")).default
      cardRef.current.style.transform = 'none'
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsGenerating(false)
          return
        }

        const file = new File([blob], `carnet-socio-${socioNumber}.png`, { type: "image/png" })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Mi Carnet de Socio",
            text: `Soy socio del Club Carlos Casares - ${socioNumber}`,
          })
        } else {
          const link = document.createElement("a")
          link.download = `carnet-socio-${socioNumber}.png`
          link.href = canvas.toDataURL("image/png")
          link.click()
        }
        setIsGenerating(false)
      })
    } catch (error) {
      console.error("Error compartiendo carnet:", error)
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Carnet con efecto 3D */}
      <div
        ref={tiltRef}
        style={{
          width: "min(980px, 100%)",
          margin: "0 auto",
          perspective: "1200px",
        }}
      >
        <div
          ref={cardRef}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            background: "linear-gradient(180deg, #f7f7f7 0%, #f1f2f4 100%)",
            borderRadius: "22px",
            boxShadow: isHovering ? "0 28px 60px rgba(0, 0, 0, .45)" : "0 22px 45px rgba(0, 0, 0, .35)",
            overflow: "hidden",
            transformStyle: "preserve-3d",
            transform: "rotateX(0deg) rotateY(0deg) translateZ(0)",
            transition: "transform 180ms ease, box-shadow 220ms ease",
            border: "1px solid rgba(255, 255, 255, .10)",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Glare effect */}
          <div
            ref={glareRef}
            style={{
              position: "absolute",
              inset: "-40%",
              background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,.40), rgba(255,255,255,0) 55%)",
              opacity: isHovering ? 0.55 : 0,
              transform: "translateZ(60px)",
              pointerEvents: "none",
              transition: "opacity 180ms ease",
              mixBlendMode: "soft-light",
              zIndex: 50,
            }}
          />

          {/* Header (34% height) */}
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "180px 1fr 200px",
              alignItems: "stretch",
              height: "34%",
            }}
          >
            {/* Corner verde con palomas */}
            <div
              style={{
                position: "relative",
                background: "linear-gradient(135deg, #2a8a63 0%, #1f7a57 100%)",
                clipPath: "polygon(0 0, 100% 0, 55% 100%, 0 100%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "18px",
                  left: "18px",
                  width: "82px",
                  height: "62px",
                  backgroundImage: `url(${AVES_IMAGE})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  opacity: 0.95,
                  filter: "drop-shadow(0 8px 10px rgba(0, 0, 0, .25))",
                }}
              />
            </div>

            {/* Titulo y badge */}
            <div style={{ padding: "22px 18px 0 12px" }}>
              <div
                style={{
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  color: "#1f2937",
                  fontSize: "clamp(20px, 3.1vw, 42px)",
                  lineHeight: 1,
                  textTransform: "uppercase",
                  marginTop: "6px",
                }}
              >
                CLUB CARLOS CASARES
              </div>
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "clamp(14px, 1.8vw, 18px)",
                    color: "#eaf6ef",
                    padding: "10px 14px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #2a8a63, #1f7a57)",
                    boxShadow: "0 10px 18px rgba(31, 122, 87, .25)",
                  }}
                >
                  SOCIO
                </div>
                <div
                  style={{
                    height: "14px",
                    flex: 1,
                    borderRadius: "999px",
                    background: "linear-gradient(90deg, rgba(31, 122, 87, .95) 0%, rgba(240, 201, 75, .95) 55%, rgba(240, 201, 75, .95) 100%)",
                    boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, .06)",
                  }}
                />
              </div>
            </div>

            {/* Escudo */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                paddingTop: "16px",
                paddingRight: "14px",
              }}
            >
              <img
                src={ESCUDO_IMAGE || "/placeholder.svg"}
                alt="Escudo Club Carlos Casares"
                style={{
                  width: "clamp(92px, 10vw, 132px)",
                  height: "auto",
                  filter: "drop-shadow(0 12px 14px rgba(0, 0, 0, .20))",
                  transform: "translateZ(26px)",
                }}
                crossOrigin="anonymous"
              />
            </div>
          </div>

          {/* Middle section (44% height) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: "26px",
              padding: "16px 26px 0 26px",
              height: "44%",
            }}
          >
            {/* Foto */}
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl || "/placeholder.svg"}
                  alt="Foto del socio"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "14px",
                    background: "#e5e7eb",
                    boxShadow: "0 18px 30px rgba(0, 0, 0, .18)",
                    transform: "translateZ(24px)",
                    border: "1px solid rgba(0, 0, 0, .06)",
                    objectFit: "cover",
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4/5",
                    borderRadius: "14px",
                    background: "#e5e7eb",
                    boxShadow: "0 18px 30px rgba(0, 0, 0, .18)",
                    transform: "translateZ(24px)",
                    border: "1px solid rgba(0, 0, 0, .06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User style={{ width: "40%", height: "40%", color: "#9ca3af" }} />
                </div>
              )}
            </div>

            {/* Data */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 260px",
                gap: "18px",
                alignItems: "center",
              }}
            >
              {/* Grid de datos */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr",
                  gap: "10px 14px",
                  alignContent: "center",
                }}
              >
                <div style={{ color: "#6b7280", fontWeight: 700, letterSpacing: "0.08em", fontSize: "12px" }}>NOMBRE</div>
                <div style={{ color: "#1f7a57", fontWeight: 800, fontSize: "30px", lineHeight: 1.1 }}>{nombre}</div>

                <div style={{ color: "#6b7280", fontWeight: 700, letterSpacing: "0.08em", fontSize: "12px" }}>APELLIDO</div>
                <div style={{ color: "#111827", fontWeight: 800, fontSize: "30px", lineHeight: 1.1 }}>{apellido?.toUpperCase()}</div>

                <div style={{ color: "#6b7280", fontWeight: 700, letterSpacing: "0.08em", fontSize: "12px" }}>DNI</div>
                <div style={{ color: "#111827", fontWeight: 800, fontSize: "26px" }}>{dni || "—"}</div>
              </div>

              {/* Right side - Desde y Categoria */}
              <div style={{ justifySelf: "end", width: "100%" }}>
                <div style={{ textAlign: "right", marginBottom: "18px" }}>
                  <div style={{ color: "#1f7a57", fontWeight: 900, letterSpacing: "0.16em", fontSize: "12px" }}>DESDE</div>
                  <div style={{ color: "#111827", fontWeight: 900, fontSize: "24px", letterSpacing: "0.02em" }}>
                    {dateFormatted.day} <span style={{ opacity: 0.35, padding: "0 6px" }}>|</span> {dateFormatted.month} <span style={{ opacity: 0.35, padding: "0 6px" }}>|</span> {dateFormatted.year}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: "10px" }}>
                  <div style={{ color: "#6b7280", fontWeight: 800, letterSpacing: "0.10em", fontSize: "12px" }}>CATEGORÍA</div>
                  <div style={{ color: "#111827", fontWeight: 900, fontSize: "18px", letterSpacing: "0.06em" }}>{memberCategory?.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ position: "relative", height: "22px", marginTop: "10px" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: "8px",
                opacity: 0.95,
                background: "linear-gradient(90deg, rgba(31, 122, 87, .92), rgba(31, 122, 87, .92))",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "9px",
                height: "8px",
                opacity: 0.95,
                background: "linear-gradient(90deg, rgba(240, 201, 75, .95), rgba(234, 179, 8, .95))",
              }}
            />
          </div>

          {/* Footer */}
          <footer
            style={{
              height: "calc(100% - 34% - 44% - 22px)",
              padding: "14px 26px 18px 26px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ color: "#4b5563", fontSize: "12px", lineHeight: 1.35 }}>
              Este carnet es de uso personal e intransferible. Su uso indebido será penado y habilita su retención.
              <br />
              En caso de extravío comuníquese con Club Carlos Casares en Av. San Martín 66, Carlos Casares, Bs. As.
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
              <div style={{ color: "#374151", fontWeight: 700, fontSize: "13px" }}>
                Tel.: <span style={{ fontVariantNumeric: "tabular-nums", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>2395 45-2525</span>
              </div>
              <div
                style={{
                  width: "120px",
                  height: "10px",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #1f7a57 0%, #1f7a57 40%, #f0c94b 60%, #f0c94b 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, .06)",
                }}
              />
            </div>
          </footer>

          {/* Grain texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E")`,
              mixBlendMode: "multiply",
            }}
          />
        </div>
      </div>

      {/* Botones de accion */}
      <div className="flex flex-wrap gap-3 max-w-md mx-auto w-full justify-center">
        <Button 
          onClick={downloadCard} 
          variant="outline" 
          className="flex-1 min-w-[120px] bg-transparent"
          disabled={isGenerating}
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "..." : "Descargar"}
        </Button>
        <Button 
          onClick={shareCard} 
          className="flex-1 min-w-[120px]"
          disabled={isGenerating}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </div>
    </div>
  )
}
