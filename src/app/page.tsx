"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

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

  const handleContinueToOtp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStep("otp")
    setIsOtpSent(false)
    setOtp("")
    setStatusMessage("")
  }

  const handleSendOtp = () => {
    setIsOtpSent(true)
    setStatusMessage(`OTP sent to ${formData.mobile}`)
  }

  const handleResendOtp = () => {
    setIsOtpSent(true)
    setStatusMessage(`OTP resent to ${formData.mobile}`)
  }

  const handleVerifyOtp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (otp.trim().length !== 6) {
      setStatusMessage("Please enter a valid 6-digit OTP")
      return
    }

    setStep("verified")
    setStatusMessage("Number verified successfully")
  }

  const handleStartExam = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push("/exam")
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start">
      {/* Background blur image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/university-campus.png')",
          filter: "blur(8px)",
          transform: "scale(1.1)",
        }}
      />

      {/* Top-left Semi Circle */}
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-500 rounded-br-full z-10"
      />
      {/* Bottom-right Semi Circle */}
      <div
        className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-red-500 rounded-tl-full z-10"
      />

      {/* Logo */}
      <div className="relative z-20 mt-16 mb-8">
        <Image
          src="/images/logo-tigps.png"
          alt="TECHNO INDIA GROUP"
          width={150}
          height={150}
          className="object-contain"
          priority
          loading="eager"
        />
      </div>

      {/* Login Container */}
      <div className="relative z-20 w-full max-w-lg px-4 flex justify-center mt-2">
        <div className="group relative w-full min-h-[520px] rounded-[36px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_24px_60px_-18px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70 backdrop-blur-3xl md:min-h-[620px] md:p-6">
          <div className="mb-4 flex items-center justify-center gap-3 md:mb-5 md:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white transition-transform group-hover:rotate-[15deg] md:h-12 md:w-12 md:rounded-2xl">
              <Image
                src="/images/tint_logo.webp"
                className="h-8 w-auto md:h-10"
                alt="TINT"
                width={40}
                height={40}
              />
            </div>
            <div className="min-w-0 pt-0.5 text-center">
              <h1 className="text-2xl font-black leading-none tracking-[-0.04em] text-transparent bg-gradient-to-r from-[#1d1a23] to-[#b91c1c] bg-clip-text md:text-4xl">
                PREPJEE
              </h1>
              <p className="mt-1 text-[11px] font-medium tracking-normal text-slate-500 md:text-xs">
                Complete your profile to continue.
              </p>
            </div>
          </div>

          {step === "details" && (
            <form className="space-y-4 md:space-y-5" onSubmit={handleContinueToOtp}>
              <div className="relative group">
                <input
                  className="peer w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder-transparent hover:border-slate-300 hover:bg-white hover:shadow-md focus:-translate-y-1 focus:border-[#6b38d4] focus:bg-white focus:ring-4 focus:ring-[#6b38d4]/15 focus:shadow-[0_18px_34px_-18px_rgba(107,56,212,0.45)] md:px-5 md:py-4 md:text-base"
                  id="fullname"
                  name="fullname"
                  placeholder=" "
                  required
                  type="text"
                  value={formData.fullname}
                  onChange={handleFieldChange}
                />
                <label
                  className="pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium text-slate-500 transition-all duration-300 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-[#b91c1c] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-90 md:left-5 md:top-4 md:text-sm"
                  htmlFor="fullname"
                >
                  Full Name
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
                <div className="relative">
                  <input
                    className="peer w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder-transparent hover:border-slate-300 hover:bg-white hover:shadow-md focus:-translate-y-1 focus:border-[#6b38d4] focus:bg-white focus:ring-4 focus:ring-[#6b38d4]/15 focus:shadow-[0_18px_34px_-18px_rgba(107,56,212,0.45)] md:px-5 md:py-4 md:text-base"
                    id="mobile"
                    name="mobile"
                    placeholder=" "
                    required
                    type="tel"
                    value={formData.mobile}
                    onChange={handleFieldChange}
                  />
                  <label
                    className="pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium text-slate-500 transition-all duration-300 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-[#b91c1c] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-90 md:left-5 md:top-4 md:text-sm"
                    htmlFor="mobile"
                  >
                    Mobile Number
                  </label>
                </div>

                <div className="relative">
                  <input
                    className="peer w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder-transparent hover:border-slate-300 hover:bg-white hover:shadow-md focus:-translate-y-1 focus:border-[#6b38d4] focus:bg-white focus:ring-4 focus:ring-[#6b38d4]/15 focus:shadow-[0_18px_34px_-18px_rgba(107,56,212,0.45)] md:px-5 md:py-4 md:text-base"
                    id="email"
                    name="email"
                    placeholder=" "
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                  />
                  <label
                    className="pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium text-slate-500 transition-all duration-300 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-[#b91c1c] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-90 md:left-5 md:top-4 md:text-sm"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
                <div className="relative group">
                  <select
                    className="peer w-full appearance-none cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-md focus:-translate-y-1 focus:border-[#6b38d4] focus:bg-white focus:ring-4 focus:ring-[#6b38d4]/15 focus:shadow-[0_18px_34px_-18px_rgba(107,56,212,0.45)] md:px-5 md:py-4 md:text-base"
                    id="class-status"
                    name="classStatus"
                    required
                    value={formData.classStatus}
                    onChange={handleFieldChange}
                  >
                    <option disabled value="" />
                    <option value="passout">12th Passout</option>
                    <option value="pursuing">Pursuing</option>
                  </select>
                  <label
                    className="pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium text-slate-500 transition-all duration-300 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-[#b91c1c] peer-valid:-translate-y-7 peer-valid:scale-90 md:left-5 md:top-4 md:text-sm"
                    htmlFor="class-status"
                  >
                    Class Status
                  </label>
                </div>

                <div className="relative group">
                  <select
                    className="peer w-full appearance-none cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-md focus:-translate-y-1 focus:border-[#6b38d4] focus:bg-white focus:ring-4 focus:ring-[#6b38d4]/15 focus:shadow-[0_18px_34px_-18px_rgba(107,56,212,0.45)] md:px-5 md:py-4 md:text-base"
                    id="stream"
                    name="stream"
                    required
                    value={formData.stream}
                    onChange={handleFieldChange}
                  >
                    <option disabled value="" />
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts</option>
                  </select>
                  <label
                    className="pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium text-slate-500 transition-all duration-300 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-[#b91c1c] peer-valid:-translate-y-7 peer-valid:scale-90 md:left-5 md:top-4 md:text-sm"
                    htmlFor="stream"
                  >
                    Stream in Class 12
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  className="peer w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder-transparent hover:border-slate-300 hover:bg-white hover:shadow-md focus:-translate-y-1 focus:border-[#6b38d4] focus:bg-white focus:ring-4 focus:ring-[#6b38d4]/15 focus:shadow-[0_18px_34px_-18px_rgba(107,56,212,0.45)] md:px-5 md:py-4 md:text-base"
                  id="city"
                  name="city"
                  placeholder=" "
                  required
                  type="text"
                  value={formData.city}
                  onChange={handleFieldChange}
                />
                <label
                  className="pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium text-slate-500 transition-all duration-300 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-[#b91c1c] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-90 md:left-5 md:top-4 md:text-sm"
                  htmlFor="city"
                >
                  City
                </label>
              </div>

              <div className="relative pt-2">
                <button
                  className="relative w-full overflow-hidden rounded-[20px] border border-[#7c1d1d] bg-gradient-to-br from-[#dc2626] via-[#b91c1c] to-[#7f1d1d] py-3 text-lg font-black text-white shadow-[0_18px_36px_-14px_rgba(127,29,29,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_-16px_rgba(127,29,29,0.75)] focus:outline-none focus:ring-4 focus:ring-[#b91c1c]/20 active:scale-[0.97] md:py-4 md:text-xl"
                  type="submit"
                >
                  <span className="relative z-10 tracking-tight">Verify Your Number</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
                </button>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form className="space-y-4 md:space-y-5 pb-4 md:pb-6" onSubmit={handleVerifyOtp}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-600 md:text-sm">
                Verify the OTP sent to {formData.mobile}
              </div>

              <div className="relative">
                <input
                  className="peer w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder-transparent hover:border-slate-300 hover:bg-white hover:shadow-md focus:-translate-y-1 focus:border-[#6b38d4] focus:bg-white focus:ring-4 focus:ring-[#6b38d4]/15 focus:shadow-[0_18px_34px_-18px_rgba(107,56,212,0.45)] md:px-5 md:py-4"
                  id="otp"
                  name="otp"
                  placeholder=" "
                  required
                  maxLength={6}
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <label
                  className="pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium text-slate-500 transition-all duration-300 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-[#b91c1c] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-90 md:left-5 md:top-4 md:text-sm"
                  htmlFor="otp"
                >
                  Enter OTP
                </label>
              </div>

              {statusMessage && (
                <p className="text-center text-[11px] font-semibold text-on-surface-variant/80 md:text-xs">
                  {statusMessage}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-6 md:pt-8">
                <button
                  type="button"
                  onClick={isOtpSent ? handleResendOtp : handleSendOtp}
                  className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-[#b91c1c]/25 hover:bg-slate-50 hover:text-[#b91c1c] focus:outline-none focus:ring-4 focus:ring-[#b91c1c]/15"
                >
                  {isOtpSent ? "Resend OTP" : "Send OTP"}
                </button>
                <button
                  type="submit"
                  className="rounded-[16px] border border-[#7c1d1d] bg-gradient-to-br from-[#dc2626] via-[#b91c1c] to-[#7f1d1d] px-4 py-3 text-sm font-black text-white shadow-[0_16px_30px_-12px_rgba(127,29,29,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-14px_rgba(127,29,29,0.7)] focus:outline-none focus:ring-4 focus:ring-[#b91c1c]/20"
                >
                  Verify OTP
                </button>
              </div>
            </form>
          )}

          {step === "verified" && (
            <form className="space-y-4 md:space-y-5" onSubmit={handleStartExam}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-600 md:text-sm">
                Your number is verified. You can now start your exam.
              </div>

              <div className="relative pt-2">
                <button
                  className="relative w-full overflow-hidden rounded-[20px] border border-[#7c1d1d] bg-gradient-to-br from-[#dc2626] via-[#b91c1c] to-[#7f1d1d] py-3 text-lg font-black text-white shadow-[0_18px_36px_-14px_rgba(127,29,29,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_-16px_rgba(127,29,29,0.75)] focus:outline-none focus:ring-4 focus:ring-[#b91c1c]/20 active:scale-[0.97] md:py-4 md:text-xl"
                  type="submit"
                >
                  <span className="relative z-10 tracking-tight">Start Your Exam</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5] via-[#8B5CF6] to-[#6b38d4] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 flex flex-col items-center pb-1 md:mt-6 md:pb-2">
            <span className="mb-2 text-[9px] font-black tracking-[0.3em] text-[#b91c1c] uppercase">
              {step === "details" ? "Step 1 of 2" : "Step 2 of 2"}
            </span>
            <div className="w-44 h-2.5 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-[#dc2626] via-[#b91c1c] to-[#7f1d1d] shadow-[0_0_16px_rgba(185,28,28,0.55)] ${
                  step === "details" ? "w-1/2" : "w-full"
                }`}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
