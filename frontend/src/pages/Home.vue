<script setup>
import { ref } from 'vue'

const text = ref('')
const role = ref('') // formerly "job"
const loading = ref(false)
const result = ref(null)
const error = ref('')

async function reviewRemote() {
  error.value = ''
  result.value = null
  loading.value = true
  try {
    const r = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.value,
        job: role.value,       // keep param name "job" for the API
        language: 'en'         // force English output
      })
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data?.error || 'Analysis failed')
    result.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 text-zinc-900">
    <header class="border-b bg-white">
      <div class="mx-auto max-w-3xl px-4 py-4">
        <h1 class="text-2xl font-semibold">AI Resume Reviewer</h1>
        <p class="text-sm text-zinc-500">Paste your resume text and get structured feedback.</p>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <section class="bg-white rounded-2xl shadow p-4 space-y-3">
        <label class="block text-sm font-medium">Target role (optional)</label>
        <input v-model="role" type="text" class="w-full rounded-md border p-2" placeholder="e.g., Laravel Backend, Vue Frontend" />

        <label class="block text-sm font-medium mt-3">Resume text</label>
        <textarea v-model="text" rows="10" class="w-full rounded-md border p-2" placeholder="Paste your resume text here..."></textarea>

        <button
          :disabled="loading || text.length < 200"
          @click="reviewRemote"
          class="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50">
          {{ loading ? 'Analyzing…' : 'Review with AI' }}
        </button>
        <p class="text-xs text-zinc-500">Minimum 200 characters to run the analysis.</p>

        <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
      </section>

      <section v-if="result" class="bg-white rounded-2xl shadow p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Result</h2>
          <div class="text-sm">Overall score: <span class="font-bold">{{ result.overallScore }}</span>/10</div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div v-for="s in result.sections" :key="s.key" class="border rounded-xl p-3">
            <div class="flex items-center justify-between">
              <h3 class="font-medium capitalize">{{ s.key }}</h3>
              <span class="text-sm bg-zinc-100 rounded px-2 py-0.5">{{ s.score }}/10</span>
            </div>
            <p class="text-sm text-zinc-600 mt-2">{{ s.feedback }}</p>
          </div>
        </div>

        <div>
          <h3 class="font-medium">Rewritten bullets</h3>
          <ul class="list-disc pl-5 text-sm text-zinc-700">
            <li v-for="(b,i) in result.bulletsRewrite" :key="i">{{ b }}</li>
          </ul>
        </div>

        <div>
          <h3 class="font-medium">Checklist</h3>
          <ul class="list-disc pl-5 text-sm text-zinc-700">
            <li v-for="(c,i) in result.checklist" :key="i">{{ c }}</li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>
