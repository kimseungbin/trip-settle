import { mount } from 'svelte'
import './i18n' // Initialize i18n before mounting app
import App from './App.svelte'

const app = mount(App, {
	target: document.getElementById('app')!,
})

export default app
