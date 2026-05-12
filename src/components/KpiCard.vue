<template>
  <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0" :class="iconColor">
        <i class="pi" :class="icon"></i>
      </span>
      <span class="text-xs text-gray-400 leading-tight">{{ label }}</span>
    </div>
    <p class="text-2xl font-bold text-gray-800">{{ value ?? 0 }}</p>
    <p class="text-xs text-gray-400">{{ sub }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  iconColor: String,
  value: [Number, String],
  label: String,
  sub: String,
});
</script>
