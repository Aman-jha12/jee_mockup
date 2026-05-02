"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstructionsPage() {
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    if (agreed) {
      router.push("/exam");
    }
  };

  return (
    <>
      {/* Inject page-specific styles and fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
        }

        .instructions-page {
          background: radial-gradient(at 0% 0%, hsla(240, 71%, 29%, 0.15) 0, transparent 50%),
                      radial-gradient(at 50% 0%, hsla(264, 100%, 39%, 0.1) 0, transparent 50%),
                      radial-gradient(at 100% 0%, hsla(217, 100%, 50%, 0.1) 0, transparent 50%),
                      #f8f9ff;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: #0d1c2e;
        }

        .inst-mesh-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          background: radial-gradient(circle at 20% 30%, rgba(97, 0, 198, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 80% 70%, rgba(21, 21, 125, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 50% 50%, rgba(79, 84, 180, 0.05) 0%, transparent 60%);
          filter: contrast(120%);
        }

        .inst-grain::before {
          content: "";
          position: fixed;
          top: -150%;
          left: -150%;
          width: 300%;
          height: 300%;
          background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuC5PKaZI-BRYvo0RJ2yCBUIszWuAE1FIIF6tafmHIlCLd56plP-lBU7MCAYKk9kYcJC8crse4B6IfRYPjFRIuZVGXAg4skX_jvOexxpHs6GXYV7_uA0Ce0C4vWzDOtVXWgFxfJoB8VKlvv5zyi34-LH-6T-JCgKZqe7h918hmap6ocxySk9A5pZrIfXUSIAOV7rirtalKeYpPLpIkqR3MU9kgI2c7JzK8EfXkOCEWkVq9WCw5h0dprph2XKHj0RnWKPOVAqDGG7bLy8);
          opacity: 0.04;
          pointer-events: none;
          z-index: 100;
          animation: inst-noise 8s steps(10) infinite;
        }

        @keyframes inst-noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }

        .inst-text-gradient {
          background: linear-gradient(135deg, #15157d 0%, #6100c6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .inst-glass-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
        }

        .inst-neon-border {
          position: relative;
        }

        .inst-neon-border::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(97, 0, 198, 0.2), rgba(21, 21, 125, 0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .inst-custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .inst-custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .inst-custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(21, 21, 125, 0.1);
          border-radius: 10px;
        }



        .inst-instruction-item:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>

      <div className="instructions-page inst-grain" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="inst-mesh-gradient" />

        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 1.5rem",
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Header */}
          <header style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.375rem 1rem",
                marginBottom: "2rem",
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(21,21,125,0.3)",
                borderRadius: "9999px",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontWeight: 700,
                color: "rgba(21,21,125,0.8)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              Academic Session 2024 • Phase 1
            </div>
            <h1
              className="inst-text-gradient"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                fontWeight: 900,
                letterSpacing: "-0.025em",
                marginBottom: "1.5rem",
                lineHeight: 1.1,
              }}
            >
              JEE Main Examination
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                color: "#464652",
                maxWidth: "48rem",
                margin: "0 auto",
                fontWeight: 500,
                lineHeight: 1.7,
                opacity: 0.8,
              }}
            >
              National Testing Agency invites you to the premier gateway for
              technical education in India. Please validate all protocols below.
            </p>
          </header>

          {/* Stats Section */}
          <section
            style={{
              width: "100vw",
              marginLeft: "calc(-50vw + 50%)",
              marginBottom: "4rem",
              padding: "3.5rem 1.5rem",
              backgroundImage: "url('/images/helpline-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "relative",
            }}
          >
            {/* Dark overlay for extra contrast */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "2rem",
                width: "100%",
                maxWidth: "64rem",
                margin: "0 auto",
                position: "relative",
                zIndex: 1,
              }}
            >
              {[
                {
                  icon: "hourglass_top",
                  label: "Duration",
                  value: "180",
                  unit: "min",
                  iconBg: "rgba(167,139,250,0.15)",
                  iconColor: "#a78bfa",
                },
                {
                  icon: "emoji_events",
                  label: "Max Marks",
                  value: "300",
                  unit: "pts",
                  iconBg: "rgba(129,140,248,0.15)",
                  iconColor: "#818cf8",
                },
                {
                  icon: "format_list_numbered",
                  label: "Questions",
                  value: "90",
                  unit: "items",
                  iconBg: "rgba(96,165,250,0.15)",
                  iconColor: "#60a5fa",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: "2rem",
                    borderRadius: "1.5rem",
                    transition: "all 0.3s",
                    cursor: "default",
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div
                      style={{
                        width: "3.5rem",
                        height: "3.5rem",
                        borderRadius: "1rem",
                        background: stat.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.iconColor,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1.875rem" }}>
                        {stat.icon}
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.5)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {stat.label}
                      </p>
                      <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#ffffff" }}>
                        {stat.value}{" "}
                        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>
                          {stat.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Main Content Card */}
          <article
            className="inst-glass-card"
            style={{
              width: "100%",
              maxWidth: "64rem",
              borderRadius: "2.5rem",
              borderColor: "rgba(255,255,255,0.6)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "700px",
            }}
          >
            {/* Card Header */}
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2rem 2.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.4)",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.75rem",
                    background: "#15157d",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    description
                  </span>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0d1c2e" }}>
                  General Instructions
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "rgba(255,255,255,0.4)",
                  borderRadius: "9999px",
                  border: "2px solid rgba(21,21,125,0.3)",
                }}
              >
                <span style={{ position: "relative", display: "flex", height: "0.5rem", width: "0.5rem" }}>
                  <span
                    style={{
                      animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
                      position: "absolute",
                      display: "inline-flex",
                      height: "100%",
                      width: "100%",
                      borderRadius: "9999px",
                      backgroundColor: "#34d399",
                      opacity: 0.75,
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      borderRadius: "9999px",
                      height: "0.5rem",
                      width: "0.5rem",
                      backgroundColor: "#10b981",
                    }}
                  />
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "rgba(13,28,46,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  90% same UI
                </span>
              </div>
            </header>

            {/* Instructions List */}
            <div
              className="inst-custom-scrollbar"
              style={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "2rem 2.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {[
                {
                  num: 1,
                  title: "Electronic Protocol",
                  desc: "Strict prohibition of electronic devices including smartwatches and calculators. Violation results in immediate disqualification.",
                },
                {
                  num: 2,
                  title: "Identity Verification",
                  desc: "Cross-verify your digital credentials with your physical Admit Card. Report any mismatch to the proctor immediately.",
                },
                {
                  num: 3,
                  title: "Navigation System",
                  desc: "Utilize the Question Palette for seamless navigation. 'Save & Next' must be explicitly used for finalizing responses.",
                },
                {
                  num: 4,
                  title: "Negative Marking Matrix",
                  desc: "Each correct answer yields +4. Each incorrect answer results in -1. Unattempted questions carry zero marks.",
                },
                {
                  num: 5,
                  title: "Auto-Submission Protocol",
                  desc: "The session will terminate automatically at the end of 180 minutes. Ensure periodic review of your progress.",
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="inst-instruction-item"
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    background: "rgba(255,255,255,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    transition: "all 0.3s",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="inst-instruction-num"
                    style={{
                      flexShrink: 0,
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "9999px",
                      background: "rgba(21,21,125,0.1)",
                      color: "#15157d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "0.875rem",
                      transition: "all 0.3s",
                    }}
                  >
                    {item.num}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: "#0d1c2e", marginBottom: "0.25rem" }}>
                      {item.title}
                    </h4>
                    <p
                      style={{
                        color: "#464652",
                        lineHeight: 1.7,
                        fontSize: "15px",
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Action */}
            <footer
              style={{
                padding: "2.5rem",
                background: "rgba(255,255,255,0.4)",
                borderTop: "1px solid rgba(255,255,255,0.4)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    maxWidth: "42rem",
                    cursor: "pointer",
                  }}
                  onClick={() => setAgreed(!agreed)}
                >
                  <div style={{ position: "relative", display: "flex", alignItems: "center", marginTop: "0.25rem" }}>
                    <input
                      id="agreement"
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      style={{
                        height: "1.5rem",
                        width: "1.5rem",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        accentColor: "#15157d",
                      }}
                    />
                  </div>
                  <label
                    htmlFor="agreement"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#464652",
                      lineHeight: 1.7,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    I confirm that I have read, understood, and will abide by all the examination
                    protocols. I acknowledge that any breach of conduct may result in legal and
                    academic penalties.
                  </label>
                </div>

                <button
                  id="startBtn"
                  onClick={handleStart}
                  disabled={!agreed}
                  style={{
                    width: "auto",
                    padding: "1.25rem 4rem",
                    background: "linear-gradient(to right, #15157d, #6100c6)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    borderRadius: "1rem",
                    boxShadow: "0 20px 25px -5px rgba(21,21,125,0.2)",
                    opacity: agreed ? 1 : 0.5,
                    cursor: agreed ? "pointer" : "not-allowed",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                    transition: "all 0.3s",
                    transform: "translateY(0)",
                  }}
                  onMouseEnter={(e) => {
                    if (agreed) {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 25px 50px -12px rgba(21,21,125,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 20px 25px -5px rgba(21,21,125,0.2)";
                  }}
                  onMouseDown={(e) => {
                    if (agreed) {
                      (e.currentTarget as HTMLElement).style.transform = "scale(0.95)";
                    }
                  }}
                  onMouseUp={(e) => {
                    if (agreed) {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    }
                  }}
                >
                  I Agree &amp; Start Examination
                  <span
                    className="material-symbols-outlined"
                    style={{ transition: "transform 0.3s" }}
                  >
                    arrow_right_alt
                  </span>
                </button>
              </div>
            </footer>
          </article>

          {/* Bottom Legend */}
          <div style={{ marginTop: "4rem", textAlign: "center" }}>
            <div
              style={{
                width: "1px",
                height: "3rem",
                background: "linear-gradient(to bottom, rgba(21,21,125,0.3), transparent)",
                margin: "0 auto 1.5rem",
              }}
            />
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#777683",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                opacity: 0.6,
              }}
            >
              Security Node: 0042A • Encrypted Session Active • NTA Cloud
            </p>
          </div>
        </main>

        {/* Global Footer */}
        <footer
          style={{
            width: "100%",
            padding: "2rem 3rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(4px)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(21,21,125,0.6)",
            }}
          >
            © 2024 National Testing Agency
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "2.5rem",
            }}
          >
            {["Accessibility", "Privacy Charter", "Data Security", "Tech Hub"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#777683",
                  textDecoration: "none",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#15157d";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#777683";
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </footer>
      </div>

      {/* Add ping animation keyframes */}
      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
