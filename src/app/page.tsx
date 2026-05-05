"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { insertUser, verifyUser } from "@/lib/api"

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
)
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
)
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
)
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
)
const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>
)
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
)
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
)
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"details" | "otp" | "verified">("details")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [formData, setFormData] = useState({
    fullname: "",
    mobile: "",
    email: "",
    classStatus: "",
    stream: "",
    city: "",
  })

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContinueToOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const id = crypto.randomUUID()
    localStorage.setItem("userId", id)
    localStorage.setItem("userName", formData.fullname)
    localStorage.removeItem("submitted")
    localStorage.removeItem("submittedUserId")
    localStorage.removeItem("examMarks")
    localStorage.removeItem("verified")

    const date_time_initial = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    localStorage.setItem("date_time_initial", date_time_initial)

    setStatusMessage("Saving your details...")

    try {
      await insertUser({
        id,
        name: formData.fullname,
        number: formData.mobile,
        city: formData.city,
        class_status: formData.classStatus,
        stream: formData.stream,
        email: formData.email,
        date_time_initial,
      })

      setStep("otp")
      setIsOtpSent(false)
      setOtp("")
      setStatusMessage("")
    } catch (error) {
      localStorage.removeItem("userId")
      const message = error instanceof Error ? error.message : "Unknown error while saving details."
      setStatusMessage(message)
    }
  }

  const handleSendOtp = () => {
    setIsOtpSent(true)
    setStatusMessage(`OTP sent to ${formData.mobile}`)
  }

  const handleResendOtp = () => {
    setIsOtpSent(true)
    setStatusMessage(`OTP resent to ${formData.mobile}`)
  }

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const id = localStorage.getItem("userId")
    const date_time_initial = localStorage.getItem("date_time_initial") || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

    if (otp.trim().length !== 6) {
      if (id) {
        await verifyUser({
          id,
          date_time_initial,
          verified: false 
        }).catch(() => {})
      }
      setStatusMessage("Please enter a valid 6-digit OTP")
      return
    }

    setStatusMessage("Verifying...")

    try {
      if (id) {
        await verifyUser({
          id,
          date_time_initial,
          verified: true,
        })
        localStorage.setItem("verified", "true")
      }

      setStep("verified")
      setStatusMessage("Number verified successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error while verifying details."
      setStatusMessage(message)
    }
  }

  const handleStartExam = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatusMessage("Redirecting...")
    router.push("/instructions")
  }

  const inputClasses = "w-full pl-11 pr-4 py-3.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-white focus:border-[rgba(255,50,50,0.6)] focus:ring-[2px] focus:ring-[rgba(255,50,50,0.15)] focus:outline-none placeholder-white/40 transition-all duration-300 text-sm"

  return (
    <div className="min-h-screen relative overflow-hidden flex w-full">
      {/* --- Global Math Definition for iOS Squircle --- */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="ios-squircle" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0 C 0.1,0 0,0.1 0,0.5 C 0,0.9 0.1,1 0.5,1 C 0.9,1 1,0.9 1,0.5 C 1,0.1 0.9,0 0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* 1. Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-30"
        style={{
          backgroundImage: "url('/images/banner.webp')",
          filter: "contrast(1.2) saturate(0.9)",
        }}
      />

      {/* 2. Gradient Overlay 1: Significantly increased fading in the middle */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: "linear-gradient(to right, rgba(3,8,20,0.85) 55%, rgba(3,8,20,0.7) 40%, rgba(3,8,20,0.7) 50%, rgba(3,8,20,0.95) 70%, rgba(3,8,20,1) 100%)",
        }}
      />

      {/* 3. Gradient Overlay 2: Top/Bottom shading perfectly synced with left edge */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: "linear-gradient(to bottom, rgba(3,8,20,0.85) 0%, transparent 20%, transparent 80%, rgba(3,8,20,0.85) 100%)",
        }}
      />

      {/* 3D BUBBLES VISUAL */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">

        {/* Orbital lines / Particle Trails */}
        <div
          className="absolute -top-[10%] -left-[20%] w-[1000px] h-[1000px] rounded-full"
          style={{
            border: "1px solid rgba(255,46,46,0.15)",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          className="absolute top-[20%] -left-[30%] w-[1200px] h-[1200px] rounded-full"
          style={{
            border: "1px solid rgba(255,46,46,0.1)",
            transform: "rotate(25deg)",
          }}
        />

        {/* Bubble 1: Giant Bottom-Left */}
        <div
          className="absolute rounded-full"
          style={{
            width: "900px",
            height: "900px",
            bottom: "-40%",
            left: "-25%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, rgba(20,5,5,0.2) 40%, rgba(255,46,46,0.1) 80%, rgba(255,46,46,0.25) 100%)",
            boxShadow: "inset 60px 60px 100px -20px rgba(255,46,46,0.9), inset 0 0 30px rgba(255,46,46,0.3), 0 0 50px rgba(255,46,46,0.2), 0 0 16px rgba(255,255,255,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(5px)"
          }}
        />

        {/* Bubble 2: Medium Middle-Left */}
        <div
          className="absolute rounded-full"
          style={{
            width: "350px",
            height: "350px",
            top: "35%",
            left: "-12%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, rgba(20,5,5,0.2) 30%, rgba(255,46,46,0.1) 70%, rgba(255,46,46,0.2) 100%)",
            boxShadow: "inset 30px 30px 60px -10px rgba(255,46,46,0.9), inset 0 0 20px rgba(255,46,46,0.3), 0 0 30px rgba(255,46,46,0.2), 0 0 12px rgba(255,255,255,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(5px)"
          }}
        />

        {/* Bubble 3: Smaller Bottom-Center */}
        <div
          className="absolute rounded-full"
          style={{
            width: "220px",
            height: "220px",
            bottom: "8%",
            left: "14%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, rgba(20,5,5,0.2) 40%, rgba(255,46,46,0.1) 80%, rgba(255,46,46,0.25) 100%)",
            boxShadow: "inset 20px 20px 40px -5px rgba(255,46,46,0.9), inset 0 0 15px rgba(255,46,46,0.3), 0 0 25px rgba(255,46,46,0.2), 0 0 10px rgba(255,255,255,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(5px)"
          }}
        />

        {/* Bubble 4: Small Top-Left */}
        <div
          className="absolute rounded-full"
          style={{
            width: "80px",
            height: "80px",
            top: "28%",
            left: "7%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, rgba(20,5,5,0.2) 30%, rgba(255,46,46,0.1) 70%, rgba(255,46,46,0.2) 100%)",
            boxShadow: "inset 10px 10px 20px rgba(255,46,46,0.9), 0 0 8px rgba(255,255,255,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.45)"
          }}
        />

        
      </div>

      {/* Main Layout Content */}
      <div className="relative z-20 w-full flex min-h-screen">
        {/* Empty left side visual space */}
        <div className="hidden lg:block lg:w-[40%]"></div>

        {/* 1. Form Card on right side (60%) */}
        <div className="w-full lg:w-[60%] flex flex-col items-center justify-center px-4 md:px-12 xl:px-20 py-10">

          <div className="w-full max-w-[500px]">
            {/* Centered Logo at top above the card - Position left identical */}
            <div className="flex justify-center mt-2 mb-5 w-full relative z-10">
              <Image
                src="/images/logo_tig.png"
                alt="TECHNO INDIA GROUP"
                width={230}
                height={230}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
                priority
                loading="eager"
              />
            </div>

            {/* 2. Dark glass card - Shifted up independently without moving the logo */}
            <div
              className="w-full p-[28px] md:p-[32px] flex flex-col gap-[28px] relative -translate-y-6"
              style={{
                background: "rgba(10, 20, 40, 0.6)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "28px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
              }}
            >
              {/* 3. Typography & iOS Squircle */}
              <div className="flex flex-col mb-2">
                <div className="flex items-center justify-center gap-6">

                  {/* --- 60x60 Pure White iOS Squircle Container --- */}
                  <div
                    className="w-[60px] h-[60px] bg-white flex items-center justify-center shrink-0"
                    style={{ clipPath: "url(#ios-squircle)" }}
                  >
                    <Image
                      src="/images/tint_logo.webp"
                      alt="Logo"
                      width={32}
                      height={36}
                      className="object-contain"
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>

                  <div className="flex flex-col text-left">
                    <h1 className="text-[36px] md:text-[40px] font-bold leading-none tracking-tight">
                      <span className="text-white">PREP</span>
                      <span className="text-[#ff2e2e]">JEE</span>
                    </h1>
                    <p className="mt-2 text-[13px] md:text-[14px] text-white/70 font-medium">
                      Complete your profile to continue.
                    </p>
                  </div>
                </div>
              </div>

              {step === "details" && (
                <form className="flex flex-col gap-[16px]" onSubmit={handleContinueToOtp}>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="text-white/40"><UserIcon /></div>
                    </div>
                    <input
                      className={inputClasses}
                      name="fullname"
                      placeholder="Full Name"
                      required
                      type="text"
                      value={formData.fullname}
                      onChange={handleFieldChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className="text-white/40"><PhoneIcon /></div>
                      </div>
                      <input
                        className={inputClasses}
                        name="mobile"
                        placeholder="Mobile Number"
                        required
                        type="tel"
                        value={formData.mobile}
                        onChange={handleFieldChange}
                      />
                    </div>

                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className="text-white/40"><MapPinIcon /></div>
                      </div>
                      <input
                        className={inputClasses}
                        name="city"
                        placeholder="City"
                        required
                        type="text"
                        value={formData.city}
                        onChange={handleFieldChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className="text-white/40"><BookIcon /></div>
                      </div>
                      <select
                        className={`${inputClasses} appearance-none cursor-pointer ${formData.classStatus ? "text-white" : "text-white/40"}`}
                        name="classStatus"
                        required
                        value={formData.classStatus}
                        onChange={handleFieldChange}
                      >
                        <option value="" disabled hidden className="bg-[#0a1428] text-white/50">Class Status</option>
                        <option value="passout" className="bg-[#0a1428] text-white">12th Passout</option>
                        <option value="pursuing" className="bg-[#0a1428] text-white">Pursuing</option>
                      </select>
                    </div>

                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className="text-white/40"><LayersIcon /></div>
                      </div>
                      <select
                        className={`${inputClasses} appearance-none cursor-pointer ${formData.stream ? "text-white" : "text-white/40"}`}
                        name="stream"
                        required
                        value={formData.stream}
                        onChange={handleFieldChange}
                      >
                        <option value="" disabled hidden className="bg-[#0a1428] text-white/50">Stream in Class 12</option>
                        <option value="PCM" className="bg-[#0a1428] text-white">PCM</option>
                        <option value="PCMB" className="bg-[#0a1428] text-white">PCMB</option>
                        <option value="PCB" className="bg-[#0a1428] text-white">PCB</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="text-white/40"><MailIcon /></div>
                    </div>
                    <input
                      className={inputClasses}
                      name="email"
                      placeholder="Email Address"
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleFieldChange}
                    />
                  </div>

                  {statusMessage && (
                    <p className="text-center text-xs font-semibold text-[#ff2e2e]/90 pb-2">
                      {statusMessage}
                    </p>
                  )}

                  {/* 5. Button */}
                  <div className="pt-2 flex flex-col items-center">
                    <button
                      className="w-full relative flex items-center justify-center py-[14px] text-white font-bold text-[15px] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #ff2e2e, #c40000)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(255, 50, 50, 0.35)",
                      }}
                      type="submit"
                    >
                      <span>Verify Your Number</span>
                      <div className="absolute right-4 text-white/80">
                        <ArrowRightIcon />
                      </div>
                    </button>

                    {/* Progress Bar */}
                    <div className="flex flex-col items-center mt-6">
                      <span className="mb-3 text-[10px] font-bold tracking-[0.2em] text-[#ff2e2e] uppercase">
                        Step 1 of 2
                      </span>
                      <div className="flex gap-2 w-28 h-[4px]">
                        <div className="h-full rounded-full bg-[#ff2e2e] shadow-[0_0_8px_rgba(255,46,46,0.6)] w-1/2" />
                        <div className="h-full rounded-full w-1/2 bg-white/10" />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {step === "otp" && (
                <form className="flex flex-col gap-[16px] pb-2" onSubmit={handleVerifyOtp}>
                  <div className="text-center text-sm font-medium text-white/70 bg-white/5 py-3 rounded-xl border border-white/5">
                    Verify the OTP sent to {formData.mobile}
                  </div>

                  <div className="relative w-full mt-2">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="text-white/40"><LockIcon /></div>
                    </div>
                    <input
                      className={`${inputClasses} tracking-[0.35em] font-semibold text-center pl-4`}
                      name="otp"
                      placeholder="• • • • • •"
                      required
                      maxLength={6}
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  {statusMessage && (
                    <p className="text-center text-xs font-semibold text-[#ff2e2e]/90">
                      {statusMessage}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      type="button"
                      onClick={isOtpSent ? handleResendOtp : handleSendOtp}
                      className="w-full py-[14px] rounded-[12px] border border-white/10 bg-white/5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                    >
                      {isOtpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                    <button
                      type="submit"
                      className="w-full relative flex items-center justify-center py-[14px] text-white font-bold text-[15px] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #ff2e2e, #c40000)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(255, 50, 50, 0.35)",
                      }}
                    >
                      <span>Verify OTP</span>
                      <div className="absolute right-4 text-white/80">
                        <ArrowRightIcon />
                      </div>
                    </button>
                  </div>
                </form>
              )}

              {step === "verified" && (
                <form className="flex flex-col gap-[16px]" onSubmit={handleStartExam}>
                  <div className="text-center text-sm font-medium text-white/80 bg-green-500/10 py-4 rounded-xl border border-green-500/20 mb-2">
                    Your number is verified. You can now start your exam.
                  </div>

                  {statusMessage && (
                    <p className="text-center text-xs font-semibold text-[#ff8080] bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                      {statusMessage}
                    </p>
                  )}

                  <div className="pt-2 flex flex-col items-center">
                    <button
                      className="w-full relative flex items-center justify-center py-[14px] text-white font-bold text-[15px] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #ff2e2e, #c40000)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(255, 50, 50, 0.35)",
                      }}
                      type="submit"
                    >
                      <span>Start Your Exam</span>
                      <div className="absolute right-4 text-white/80">
                        <ArrowRightIcon />
                      </div>
                    </button>

                    {/* Progress Bar */}
                    <div className="flex flex-col items-center mt-6">
                      <span className="mb-3 text-[10px] font-bold tracking-[0.2em] text-[#ff2e2e] uppercase">
                        Step 2 of 2
                      </span>
                      <div className="flex gap-2 w-28 h-[4px]">
                        <div className="h-full rounded-full bg-[#ff2e2e] shadow-[0_0_8px_rgba(255,46,46,0.6)] w-1/2" />
                        <div className="h-full rounded-full bg-[#ff2e2e] shadow-[0_0_8px_rgba(255,46,46,0.6)] w-1/2" />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}