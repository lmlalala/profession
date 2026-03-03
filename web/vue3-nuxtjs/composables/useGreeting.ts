import { ref, computed } from 'vue'

export function useGreeting(name: string) {
  const greeting = ref(`Hello, ${name}!`)
  const upperGreeting = computed(() => greeting.value.toUpperCase())

  function updateName(newName: string) {
    greeting.value = `Hello, ${newName}!`
  }

  return { greeting, upperGreeting, updateName }
}
