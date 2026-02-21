import { NextResponse } from 'next/server'

export async function GET() {
  // Verificar si el token de Blob está configurado
  const configured = !!process.env.BLOB_READ_WRITE_TOKEN
  
  return NextResponse.json({ configured })
}
