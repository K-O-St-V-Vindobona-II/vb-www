<script setup lang="ts">
import AppNav from '@/components/AppNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ProgrammSection from '@/components/sections/ProgrammSection.vue'
import GallerySection from '@/components/sections/GallerySection.vue'
import MitgliedWerdenSection from '@/components/sections/MitgliedWerdenSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
</script>

<template>
  <AppNav />
  <main>
    <HeroSection />
    <AboutSection />
    <GallerySection />
    <ProgrammSection />
    <MitgliedWerdenSection />
    <ContactSection />
  </main>
  <AppFooter />
</template>
