
import prisma from "@/prisma/client"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signupSchema } from "../../validation/signup"

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = signupSchema.safeParse(json)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json({ ok: false, errors }, { status: 400 })
    }
   
    const { name, email, password } = parsed.data as {
      name: string
      email: string
      password: string
      confirmPassword: string
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { ok: false, errors: { email: ["Email already exists"] } },
        { status: 400 }
      )
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })
    
    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (err) {
    console.error("signup error", err)
    return NextResponse.json(
      { ok: false, message: "Failed to create account" },
      { status: 500 }
    )
  }
}
