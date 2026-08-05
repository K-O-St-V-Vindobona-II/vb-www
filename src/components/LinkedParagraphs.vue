<script setup lang="ts">
import { computed } from 'vue'
import { parseParagraphs } from '@/utils/parseLinkedText'

const props = defineProps<{ text: string }>()

const paragraphs = computed(() => parseParagraphs(props.text))
</script>

<template>
  <p v-for="(segments, pIndex) in paragraphs" :key="pIndex">
    <template v-for="(segment, sIndex) in segments" :key="sIndex">
      <a v-if="segment.type === 'link'" :href="segment.url" target="_blank" rel="noopener">{{
        segment.text
      }}</a>
      <template v-else>{{ segment.value }}</template>
    </template>
  </p>
</template>

<style scoped>
p {
  margin: 0 0 1rem;
  line-height: 1.7;
}

p:last-child {
  margin-bottom: 0;
}

a {
  font-weight: 700;
}
</style>
