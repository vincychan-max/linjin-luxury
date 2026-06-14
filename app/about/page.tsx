"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";

export default function AboutPage() {

  useEffect(() => {
    const id = "about-lv-theme";

    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      body {
        background: #000;
      }

      header, header a, header span, header button, header svg {
        color: white !important;
        stroke: white !important;
      }

      header {
        background: transparent !important;
        border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        backdrop-filter: blur(12px);
      }

      header img:not(.no-invert) {
        filter: invert(1) brightness(2);
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  const fade = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: "easeOut" },
    viewport: { once: true }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Linjin Luxury",
    "url": "https://www.linjinluxury.com",
    "logo": "https://www.linjinluxury.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "info@linjinluxury.com"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Guangzhou",
      "addressCountry": "CN"
    }
  };

  return (
    <main className="bg-black text-white">

      <Script
        id="jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* CHAPTER 1 — HERO */}
      <section className="h-screen flex items-center justify-center text-center px-6">
        <motion.div {...fade} className="max-w-3xl">

          <p className="text-[10px] tracking-[0.5em] uppercase text-white/40 mb-10">
            Maison Linjin
          </p>

          <h1 className="text-5xl md:text-8xl tracking-[0.2em] font-extralight mb-10">
            LINJIN
          </h1>

          <p className="text-sm md:text-base text-white/60 leading-relaxed">
            A house built on restraint, material truth, and direct creation.
          </p>

        </motion.div>
      </section>

      {/* CHAPTER 2 — ORIGIN */}
      <section className="min-h-screen flex items-center border-t border-white/10 px-6">
        <div className="max-w-4xl mx-auto">

          <motion.p {...fade} className="text-xs tracking-[0.4em] text-white/40 mb-10">
            CHAPTER I — ORIGIN
          </motion.p>

          <motion.h2 {...fade} className="text-3xl md:text-5xl font-extralight leading-tight mb-12">
            We do not resell luxury. <br />
            We create from origin.
          </motion.h2>

          <motion.p {...fade} className="text-white/60 leading-loose max-w-2xl">
            Linjin Luxury operates directly from its atelier in Guangzhou.
            Every piece begins from material selection, not retail shelves.
            The goal is not volume — it is permanence.
          </motion.p>

        </div>
      </section>

      {/* CHAPTER 3 — MATERIAL */}
      <section className="min-h-screen flex items-center border-t border-white/10 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">

          <motion.p {...fade} className="text-xs tracking-[0.4em] text-white/40 mb-10">
            CHAPTER II — MATERIAL
          </motion.p>

          <motion.h2 {...fade} className="text-3xl md:text-5xl font-extralight mb-12">
            Leather is not decoration.<br />
            It is structure.
          </motion.h2>

          <motion.p {...fade} className="text-white/60 leading-loose max-w-2xl">
            We work with selected cowhide and structured leathers.
            Each surface is chosen for aging behavior, not appearance alone.
          </motion.p>

        </div>
      </section>

      {/* CHAPTER 4 — MODEL */}
      <section className="min-h-screen flex items-center border-t border-white/10 px-6">
        <div className="max-w-4xl mx-auto">

          <motion.p {...fade} className="text-xs tracking-[0.4em] text-white/40 mb-10">
            CHAPTER III — MODEL
          </motion.p>

          <motion.h2 {...fade} className="text-3xl md:text-5xl font-extralight mb-12">
            Direct to consumer.<br />
            Without interruption.
          </motion.h2>

          <motion.p {...fade} className="text-white/60 leading-loose max-w-2xl">
            By removing retail layers, we preserve design intent and material value.
            What remains is direct connection between maker and client.
          </motion.p>

        </div>
      </section>

      {/* CHAPTER 5 — CLOSING */}
      <section className="h-screen flex items-center justify-center text-center px-6 border-t border-white/10">
        <motion.div {...fade} className="max-w-2xl">

          <p className="text-xl md:text-3xl font-extralight leading-relaxed text-white/80">
            “Luxury is not created by excess, but by restraint.”
          </p>

          <div className="mt-16 flex gap-6 justify-center">
            <Link
              href="/collection/all"
              className="border border-white/20 px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition"
            >
              Explore
            </Link>

            <Link
              href="/contact"
              className="bg-white text-black px-10 py-4 text-xs tracking-[0.3em] uppercase"
            >
              Contact
            </Link>
          </div>

        </motion.div>
      </section>

    </main>
  );
}