"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { checkAttempts, verifyUser, createUser } from "@/lib/sheets-api"
import { validateForm, getFieldError } from "@/lib/validation"
import { clearAllExamData, saveVerifiedUser } from "@/lib/exam-session"
import type { ValidationError } from "@/lib/validation"

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
  const [step, setStep] = useState<"details" | "otp" | "verified" | "blocked">("details")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [formErrors, setFormErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    classStatus: "",
    stream: "",
    city: "",
  })

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field error when user starts typing
    setFormErrors((prev) => prev.filter((err) => err.field !== name))
  }

  const handleContinueToOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormErrors([])
    setStatusMessage("")
    setApiError(null)

    // Validate form
    const validation = validateForm(formData)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }

    setIsLoading(true)
    setStatusMessage("Checking attempts...")

    try {
      // Step 1: Create or update user
      setStatusMessage("Creating user profile...")
      const createResult = await createUser(formData)
      if (!createResult.success) {
        setApiError(createResult.error?.message || "Failed to create user profile.")
        setIsLoading(false)
        return
      }

      setStatusMessage("Checking attempts...")
      // Step 1: Check if user has attempts remaining
      const checkResult = await checkAttempts(formData.number)

      if (!checkResult.success) {
        setApiError(checkResult.error?.message || "Failed to check attempts. Please try again.")
        setIsLoading(false)
        return
      }

      // Step 2: If not allowed, block user
      if (!checkResult.allowed) {
        setStep("blocked")
        setStatusMessage("You have already used your maximum 2 attempts.")
        setIsLoading(false)
        return
      }

      // Step 3: Proceed to OTP
      setStep("otp")
      setIsOtpSent(false)
      setOtp("")
      setStatusMessage("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      setApiError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = () => {
    setIsOtpSent(true)
    setStatusMessage(`OTP sent to ${formData.number}`)
  }

  const handleResendOtp = () => {
    setIsOtpSent(true)
    setStatusMessage(`OTP resent to ${formData.number}`)
  }

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setApiError(null)
    setStatusMessage("")

    if (otp.trim().length !== 6) {
      setStatusMessage("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    setStatusMessage("Verifying OTP...")

    try {
      // Call verifyUser with all user details
      // Backend will create new user or update existing user, mark verified=true, increment attempts
      const verifyResult = await verifyUser({
        number: formData.number,
        name: formData.name,
        city: formData.city,
        classStatus: formData.classStatus,
        stream: formData.stream,
        email: formData.email,
      })

      if (!verifyResult.success) {
        setApiError(verifyResult.error?.message || "OTP verification failed. Please try again.")
        setIsLoading(false)
        return
      }

      // Clear any previous exam submission state for a fresh attempt
      clearAllExamData()

      // Save verified user to session storage
      const verifiedUserData = {
        name: formData.name,
        number: formData.number,
        city: formData.city,
        classStatus: formData.classStatus,
        stream: formData.stream,
        email: formData.email,
        attempts: verifyResult.attempts,
        verifiedAt: Date.now(),
      }

      saveVerifiedUser(verifiedUserData)

      setStep("verified")
      setStatusMessage("Number verified successfully!")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error while verifying OTP"
      setApiError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartExam = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setStatusMessage("Redirecting...")
    router.push("/instructions")
  }

  const inputClasses = "w-full pl-[2.75rem] pr-4 py-3 md:py-3.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:border-[rgba(255,50,50,0.6)] focus:ring-[2px] focus:ring-[rgba(255,50,50,0.15)] focus:outline-none placeholder-white/40 transition-all duration-300 text-xs md:text-sm"

  return (
    <div className="h-screen relative overflow-hidden flex w-full justify-center">
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
          className="absolute -top-[10%] -left-[20%] w-[800px] h-[800px] rounded-full"
          style={{ border: "1px solid rgba(255,46,46,0.15)", transform: "rotate(-15deg)" }}
        />
        <div
          className="absolute top-[20%] -left-[30%] w-[950px] h-[950px] rounded-full"
          style={{ border: "1px solid rgba(255,46,46,0.1)", transform: "rotate(25deg)" }}
        />

        {/* Bubbles */}
        <div
          className="absolute rounded-full"
          style={{
            width: "48rem", height: "48rem", bottom: "-40%", left: "-25%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, rgba(20,5,5,0.2) 40%, rgba(255,46,46,0.1) 80%, rgba(255,46,46,0.25) 100%)",
            boxShadow: "inset 60px 60px 100px -20px rgba(255,46,46,0.9), inset 0 0 30px rgba(255,46,46,0.3), 0 0 50px rgba(255,46,46,0.2), 0 0 16px rgba(255,255,255,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.45)", backdropFilter: "blur(5px)"
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "18rem", height: "18rem", top: "35%", left: "-12%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, rgba(20,5,5,0.2) 30%, rgba(255,46,46,0.1) 70%, rgba(255,46,46,0.2) 100%)",
            boxShadow: "inset 30px 30px 60px -10px rgba(255,46,46,0.9), inset 0 0 20px rgba(255,46,46,0.3), 0 0 30px rgba(255,46,46,0.2), 0 0 12px rgba(255,255,255,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.45)", backdropFilter: "blur(5px)"
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "11rem", height: "11rem", bottom: "8%", left: "14%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, rgba(20,5,5,0.2) 40%, rgba(255,46,46,0.1) 80%, rgba(255,46,46,0.25) 100%)",
            boxShadow: "inset 20px 20px 40px -5px rgba(255,46,46,0.9), inset 0 0 15px rgba(255,46,46,0.3), 0 0 25px rgba(255,46,46,0.2), 0 0 10px rgba(255,255,255,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.45)", backdropFilter: "blur(5px)"
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "4rem", height: "4rem", top: "28%", left: "7%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, rgba(20,5,5,0.2) 30%, rgba(255,46,46,0.1) 70%, rgba(255,46,46,0.2) 100%)",
            boxShadow: "inset 10px 10px 20px rgba(255,46,46,0.9), 0 0 8px rgba(255,255,255,0.2)", border: "1px solid rgba(255, 255, 255, 0.45)"
          }}
        />
      </div>

      {/* Main Layout Content Container */}
      <div className="relative z-20 w-full max-w-[1280px] flex h-screen">
        {/* Empty left side visual space */}
        <div className="hidden lg:block lg:w-[45%] h-full"></div>

        {/* 1. Form Card on right side (55%) */}
        <div className="w-full lg:w-[55%] h-full flex flex-col items-center justify-center px-4 md:px-8 xl:px-12">

          <div className="w-full max-w-[26rem] md:max-w-[28rem] transform scale-[0.85] sm:scale-90 md:scale-[0.85] lg:scale-90 origin-center flex flex-col">
            {/* Centered Logo at top above the card */}
            <div className="flex justify-center mt-2 mb-4 w-full relative z-10">
              <Image
                src="/images/logo_tig.png"
                alt="TECHNO INDIA GROUP"
                width={200}
                height={200}
                className="object-contain w-auto h-auto max-w-[11rem] md:max-w-[13rem]"
                priority
                loading="eager"
              />
            </div>

            {/* 2. Dark glass card */}
            <div
              className="w-full p-6 md:p-8 flex flex-col gap-5 md:gap-6 relative -translate-y-4"
              style={{
                background: "rgba(10, 20, 40, 0.6)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "1.5rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
              }}
            >
              {/* 3. Typography & iOS Squircle */}
              <div className="flex flex-col mb-1">
                <div className="flex items-center justify-center gap-4 md:gap-5">

                  {/* iOS Squircle Container */}
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 bg-white flex items-center justify-center shrink-0"
                    style={{ clipPath: "url(#ios-squircle)" }}
                  >
                    <Image
                      src="/images/tint_logo.webp"
                      alt="Logo"
                      width={28}
                      height={32}
                      className="object-contain w-auto h-auto max-w-[1.5rem] md:max-w-[1.75rem]"
                    />
                  </div>

                  <div className="flex flex-col text-left">
                    <h1 className="text-2xl md:text-3xl font-bold leading-none tracking-tight">
                      <span className="text-white">PREP</span>
                      <span className="text-[#ff2e2e]">JEE</span>
                    </h1>
                    <p className="mt-1 text-[11px] md:text-xs text-white/70 font-medium">
                      Complete your profile to continue.
                    </p>
                  </div>
                </div>
              </div>

              {step === "details" && (
                <form className="flex flex-col gap-3 md:gap-4" onSubmit={handleContinueToOtp}>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                      <div className="text-white/40 scale-90 md:scale-100"><UserIcon /></div>
                    </div>
                    <input
                      className={inputClasses}
                      name="name"
                      placeholder="Full Name"
                      required
                      type="text"
                      value={formData.name}
                      onChange={handleFieldChange}
                    />
                    {getFieldError(formErrors, "name") && (
                      <p className="text-[10px] md:text-xs text-red-400/80 mt-1">{getFieldError(formErrors, "name")}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                        <div className="text-white/40 scale-90 md:scale-100"><PhoneIcon /></div>
                      </div>
                      <input
                        className={inputClasses}
                        name="number"
                        placeholder="Mobile Number"
                        required
                        type="tel"
                        value={formData.number}
                        onChange={handleFieldChange}
                      />
                      {getFieldError(formErrors, "number") && (
                        <p className="text-[10px] md:text-xs text-red-400/80 mt-1">{getFieldError(formErrors, "number")}</p>
                      )}
                    </div>

                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                        <div className="text-white/40 scale-90 md:scale-100"><MapPinIcon /></div>
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
                      {getFieldError(formErrors, "city") && (
                        <p className="text-[10px] md:text-xs text-red-400/80 mt-1">{getFieldError(formErrors, "city")}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                        <div className="text-white/40 scale-90 md:scale-100"><BookIcon /></div>
                      </div>
                      <select
                        className={`${inputClasses} appearance-none cursor-pointer ${formData.classStatus ? "text-white" : "text-white/40"}`}
                        name="classStatus"
                        required
                        value={formData.classStatus}
                        onChange={handleFieldChange}
                      >
                        <option value="" disabled hidden className="bg-[#0a1428] text-white/50">Class Status</option>
                        <option value="12th pursuing" className="bg-[#0a1428] text-white">12th Pursuing</option>
                        <option value="passout" className="bg-[#0a1428] text-white">Passout</option>
                      </select>
                      {getFieldError(formErrors, "classStatus") && (
                        <p className="text-[10px] md:text-xs text-red-400/80 mt-1">{getFieldError(formErrors, "classStatus")}</p>
                      )}
                    </div>

                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                        <div className="text-white/40 scale-90 md:scale-100"><LayersIcon /></div>
                      </div>
                      <select
                        className={`${inputClasses} appearance-none cursor-pointer ${formData.stream ? "text-white" : "text-white/40"}`}
                        name="stream"
                        required
                        value={formData.stream}
                        onChange={handleFieldChange}
                      >
                        <option value="" disabled hidden className="bg-[#0a1428] text-white/50">Stream</option>
                        <option value="PCM" className="bg-[#0a1428] text-white">PCM</option>
                        <option value="PCB" className="bg-[#0a1428] text-white">PCB</option>
                        <option value="PCMB" className="bg-[#0a1428] text-white">PCMB</option>
                      </select>
                      {getFieldError(formErrors, "stream") && (
                        <p className="text-[10px] md:text-xs text-red-400/80 mt-1">{getFieldError(formErrors, "stream")}</p>
                      )}
                    </div>
                  </div>

                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                      <div className="text-white/40 scale-90 md:scale-100"><MailIcon /></div>
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
                    {getFieldError(formErrors, "email") && (
                      <p className="text-[10px] md:text-xs text-red-400/80 mt-1">{getFieldError(formErrors, "email")}</p>
                    )}
                  </div>

                  {apiError && (
                    <p className="text-center text-[11px] md:text-xs font-semibold text-red-400/90 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                      {apiError}
                    </p>
                  )}

                  {statusMessage && (
                    <p className="text-center text-[11px] md:text-xs font-semibold text-blue-400/90 pb-1">
                      {statusMessage}
                    </p>
                  )}

                  {/* 5. Button */}
                  <div className="pt-2 flex flex-col items-center">
                    <button
                      className="w-full relative flex items-center justify-center py-3 md:py-3.5 text-white font-bold text-sm transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
                      style={{
                        background: "linear-gradient(135deg, #ff2e2e, #c40000)",
                        borderRadius: "0.75rem",
                        boxShadow: "0 8px 24px rgba(255, 50, 50, 0.35)",
                      }}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>continue</span>
                          <div className="absolute right-4 text-white/80 scale-90 md:scale-100">
                            <ArrowRightIcon />
                          </div>
                        </>
                      )}
                    </button>

                    {/* Progress Bar */}
                    <div className="flex flex-col items-center mt-5">
                      <span className="mb-2 text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-[#ff2e2e] uppercase">
                        Step 1 of 2
                      </span>
                      <div className="flex gap-2 w-24 h-1">
                        <div className="h-full rounded-full bg-[#ff2e2e] shadow-[0_0_8px_rgba(255,46,46,0.6)] w-1/2" />
                        <div className="h-full rounded-full w-1/2 bg-white/10" />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {step === "otp" && (
                <form className="flex flex-col gap-3 md:gap-4 pb-2" onSubmit={handleVerifyOtp}>
                  <div className="text-center text-xs md:text-sm font-medium text-white/70 bg-white/5 py-3 rounded-xl border border-white/5">
                    Verify the OTP sent to {formData.number}
                  </div>

                  <div className="relative w-full mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                      <div className="text-white/40 scale-90 md:scale-100"><LockIcon /></div>
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

                  {apiError && (
                    <p className="text-center text-[11px] md:text-xs font-semibold text-red-400/90 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                      {apiError}
                    </p>
                  )}

                  {statusMessage && (
                    <p className="text-center text-[11px] md:text-xs font-semibold text-blue-400/90">
                      {statusMessage}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      type="button"
                      onClick={isOtpSent ? handleResendOtp : handleSendOtp}
                      className="w-full py-3 md:py-3.5 rounded-xl border border-white/10 bg-white/5 text-xs md:text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isOtpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                    <button
                      type="submit"
                      className="w-full relative flex items-center justify-center py-3 md:py-3.5 text-white font-bold text-xs md:text-sm transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
                      style={{
                        background: "linear-gradient(135deg, #ff2e2e, #c40000)",
                        borderRadius: "0.75rem",
                        boxShadow: "0 8px 24px rgba(255, 50, 50, 0.35)",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Verify OTP</span>
                          <div className="absolute right-3 text-white/80 scale-90 md:scale-100">
                            <ArrowRightIcon />
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === "verified" && (
                <form className="flex flex-col gap-3 md:gap-4" onSubmit={handleStartExam}>
                  <div className="text-center text-xs md:text-sm font-medium text-white/80 bg-green-500/10 py-4 rounded-xl border border-green-500/20 mb-1">
                    Your number is verified. You can now start your exam.
                  </div>

                  {statusMessage && (
                    <p className="text-center text-[11px] md:text-xs font-semibold text-blue-400/90">
                      {statusMessage}
                    </p>
                  )}

                  <div className="pt-2 flex flex-col items-center">
                    <button
                      className="w-full relative flex items-center justify-center py-3 md:py-3.5 text-white font-bold text-sm transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
                      style={{
                        background: "linear-gradient(135deg, #ff2e2e, #c40000)",
                        borderRadius: "0.75rem",
                        boxShadow: "0 8px 24px rgba(255, 50, 50, 0.35)",
                      }}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Start Your Exam</span>
                          <div className="absolute right-4 text-white/80 scale-90 md:scale-100">
                            <ArrowRightIcon />
                          </div>
                        </>
                      )}
                    </button>

                    {/* Progress Bar */}
                    <div className="flex flex-col items-center mt-5">
                      <span className="mb-2 text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-[#ff2e2e] uppercase">
                        Step 2 of 2
                      </span>
                      <div className="flex gap-2 w-24 h-1">
                        <div className="h-full rounded-full bg-[#ff2e2e] shadow-[0_0_8px_rgba(255,46,46,0.6)] w-1/2" />
                        <div className="h-full rounded-full bg-[#ff2e2e] shadow-[0_0_8px_rgba(255,46,46,0.6)] w-1/2" />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {step === "blocked" && (
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ background: "rgba(220, 38, 38, 0.15)" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-500"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>

                    <h2 className="text-center text-xl md:text-2xl font-bold text-white mb-3">
                      Exam Attempts Exhausted
                    </h2>

                    <p className="text-center text-sm md:text-base text-white/80 leading-relaxed">
                      You have already used your maximum 2 attempts for this examination.
                    </p>

                    <p className="text-center text-xs md:text-sm text-white/60 mt-4">
                      Please contact support if you believe this is an error.
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-lg border"
                    style={{ background: "rgba(220, 38, 38, 0.05)", borderColor: "rgba(220, 38, 38, 0.2)" }}
                  >
                    <p className="text-xs md:text-sm text-white/70 text-center flex items-center justify-center gap-2 group">
                      <span className="text-white/60 transition group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]">
                        <MailIcon />
                      </span>
                      <span>
                        For assistance, contact the examination authority.
                        <a
                          href="mailto:kallol.bhattacharya@tint.edu.in"
                          className="ml-1 text-white/80 underline underline-offset-2 transition group-hover:text-white"
                        >
                          kallol.bhattacharya@tint.edu.in
                        </a>
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}