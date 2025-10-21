<script lang="ts" ✂prettier:content✂="CglpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSAnc3ZlbHRlJwoJaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi9jb25maWcnCgoJbGV0IGNvdW50ID0gMAoJbGV0IGhlYWx0aFN0YXR1cyA9ICdsb2FkaW5nJwoJbGV0IGRhdGFiYXNlU3RhdHVzID0gJ2xvYWRpbmcnCglsZXQgYXBpVXJsID0gJycKCglmdW5jdGlvbiBpbmNyZW1lbnQoKSB7CgkJY291bnQgKz0gMQoJfQoKCWFzeW5jIGZ1bmN0aW9uIGNoZWNrSGVhbHRoKCkgewoJCXRyeSB7CgkJCWNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9hcGkvaGVhbHRoJykKCQkJY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKQoJCQloZWFsdGhTdGF0dXMgPSBkYXRhLnN0YXR1cyA9PT0gJ29rJyA/ICdvaycgOiAnZXJyb3InCgkJCWRhdGFiYXNlU3RhdHVzID0gZGF0YS5kYXRhYmFzZSA9PT0gJ29rJyA/ICdvaycgOiAnZXJyb3InCgkJfSBjYXRjaCAoZXJyb3IpIHsKCQkJaGVhbHRoU3RhdHVzID0gJ2Vycm9yJwoJCQlkYXRhYmFzZVN0YXR1cyA9ICdlcnJvcicKCQkJY29uc29sZS5lcnJvcignSGVhbHRoIGNoZWNrIGZhaWxlZDonLCBlcnJvcikKCQl9Cgl9CgoJb25Nb3VudCgoKSA9PiB7CgkJYXBpVXJsID0gY29uZmlnLmFwaVVybAoJCWNoZWNrSGVhbHRoKCkKCX0pCg==">{}</script>

<main>
	<h1>Trip Settle</h1>
	<p>Expense settlement made easy</p>

	<div class="status">
		<h3>System Status</h3>
		<p class="api-url">{apiUrl}</p>

		<div class="status-row">
			<span class="label">Backend:</span>
			<div class="health {healthStatus}">
				{#if healthStatus === 'loading'}
					<span>⏳ Checking...</span>
				{:else if healthStatus === 'ok'}
					<span>✅ Healthy</span>
				{:else}
					<span>❌ Error</span>
				{/if}
			</div>
		</div>

		<div class="status-row">
			<span class="label">Database:</span>
			<div class="health {databaseStatus}">
				{#if databaseStatus === 'loading'}
					<span>⏳ Checking...</span>
				{:else if databaseStatus === 'ok'}
					<span>✅ Connected</span>
				{:else}
					<span>❌ Disconnected</span>
				{/if}
			</div>
		</div>
	</div>

	<button on:click={increment}>
		Count: {count}
	</button>
</main>

<style ✂prettier:content✂="CgltYWluIHsKCQl0ZXh0LWFsaWduOiBjZW50ZXI7CgkJcGFkZGluZzogMWVtOwoJCW1heC13aWR0aDogNjAwcHg7CgkJbWFyZ2luOiAwIGF1dG87Cgl9CgoJaDEgewoJCWNvbG9yOiAjZmYzZTAwOwoJCXRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CgkJZm9udC1zaXplOiA0ZW07CgkJZm9udC13ZWlnaHQ6IDEwMDsKCQltYXJnaW4tYm90dG9tOiAwLjJlbTsKCX0KCgloMyB7CgkJbWFyZ2luOiAxZW0gMCAwLjVlbTsKCQljb2xvcjogIzMzMzsKCX0KCgkuc3RhdHVzIHsKCQltYXJnaW46IDJlbSAwOwoJCXBhZGRpbmc6IDEuNWVtOwoJCWJvcmRlci1yYWRpdXM6IDhweDsKCQliYWNrZ3JvdW5kOiAjZjVmNWY1OwoJfQoKCS5hcGktdXJsIHsKCQlmb250LWZhbWlseTogbW9ub3NwYWNlOwoJCWZvbnQtc2l6ZTogMC45ZW07CgkJY29sb3I6ICM2NjY7CgkJbWFyZ2luOiAwLjVlbSAwIDFlbTsKCX0KCgkuc3RhdHVzLXJvdyB7CgkJZGlzcGxheTogZmxleDsKCQlhbGlnbi1pdGVtczogY2VudGVyOwoJCWdhcDogMWVtOwoJCW1hcmdpbi1ib3R0b206IDAuNzVlbTsKCX0KCgkuc3RhdHVzLXJvdzpsYXN0LWNoaWxkIHsKCQltYXJnaW4tYm90dG9tOiAwOwoJfQoKCS5zdGF0dXMtcm93IC5sYWJlbCB7CgkJZm9udC13ZWlnaHQ6IDYwMDsKCQltaW4td2lkdGg6IDgwcHg7CgkJY29sb3I6ICMzMzM7Cgl9CgoJLmhlYWx0aCB7CgkJcGFkZGluZzogMC41ZW0gMWVtOwoJCWJvcmRlci1yYWRpdXM6IDZweDsKCQlmb250LXdlaWdodDogYm9sZDsKCQlmbGV4OiAxOwoJfQoKCS5oZWFsdGgubG9hZGluZyB7CgkJYmFja2dyb3VuZDogI2ZmZjNjZDsKCQljb2xvcjogIzg1NjQwNDsKCX0KCgkuaGVhbHRoLm9rIHsKCQliYWNrZ3JvdW5kOiAjZDRlZGRhOwoJCWNvbG9yOiAjMTU1NzI0OwoJfQoKCS5oZWFsdGguZXJyb3IgewoJCWJhY2tncm91bmQ6ICNmOGQ3ZGE7CgkJY29sb3I6ICM3MjFjMjQ7Cgl9CgoJYnV0dG9uIHsKCQltYXJnaW4tdG9wOiAyZW07CgkJcGFkZGluZzogMC41ZW0gMWVtOwoJCWZvbnQtc2l6ZTogMWVtOwoJCWN1cnNvcjogcG9pbnRlcjsKCX0KCglAbWVkaWEgKG1pbi13aWR0aDogNjQwcHgpIHsKCQltYWluIHsKCQkJbWF4LXdpZHRoOiA3MDBweDsKCQl9Cgl9Cg=="></style>
