import { useEffect, useState } from 'react'

const STORAGE_KEY = 'my-journal-entries'

function loadEntries() {
	try {
		const savedEntries = localStorage.getItem(STORAGE_KEY)
		if (!savedEntries) return []

		const parsedEntries = JSON.parse(savedEntries)
		return Array.isArray(parsedEntries)
			? parsedEntries.filter(
					(entry) =>
						typeof entry.id === 'string' &&
						typeof entry.date === 'string' &&
						typeof entry.body === 'string' &&
						typeof entry.createdAt === 'number',
				)
			: []
	} catch {
		return []
	}
}

const getToday = () => {
	const today = new Date()
	const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
	return localDate.toISOString().slice(0, 10)
}

function App() {
	const [date, setDate] = useState(getToday)
	const [body, setBody] = useState('')
	const [entries, setEntries] = useState(loadEntries)

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
		} catch {
			// The app remains usable if browser storage is unavailable.
		}
	}, [entries])

	const sortedEntries = [...entries].sort(
		(a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
	)

	function handleSubmit(event) {
		event.preventDefault()
		const text = body.trim()
		if (!date || !text) return

		setEntries((currentEntries) => [
			...currentEntries,
			{ id: `${Date.now()}-${Math.random()}`, date, body: text, createdAt: Date.now() },
		])
		setBody('')
	}

	function handleDelete(id) {
		setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id))
	}

	return (
		<main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-800 sm:py-16">
			<div className="mx-auto max-w-2xl">
				<header className="mb-8 text-center sm:mb-10">
					<p className="mb-2 text-sm font-semibold tracking-[0.2em] text-rose-500">MY JOURNAL</p>
					<h1 className="mb-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
						今日の日記
					</h1>
					<p className="text-sm text-stone-500">今日あったことを、ひとことずつ。</p>
				</header>

				<form
					onSubmit={handleSubmit}
					className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
				>
					<label htmlFor="diary-date" className="mb-2 block text-sm font-semibold text-stone-700">
						日付
					</label>
					<input
						id="diary-date"
						type="date"
						value={date}
						onChange={(event) => setDate(event.target.value)}
						required
						className="mb-5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
					/>

					<label htmlFor="diary-body" className="mb-2 block text-sm font-semibold text-stone-700">
						本文
					</label>
					<textarea
						id="diary-body"
						value={body}
						onChange={(event) => setBody(event.target.value)}
						placeholder="今日はどんな一日でしたか？"
						rows={5}
						required
						className="mb-4 w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2.5 leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
					/>

					<div className="flex justify-end">
						<button
							type="submit"
							className="rounded-lg bg-rose-500 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-200"
						>
							保存する
						</button>
					</div>
				</form>

				<section aria-labelledby="entries-heading">
					<div className="mb-4 flex items-center justify-between">
						<h2 id="entries-heading" className="text-lg font-bold text-stone-900">
							日記一覧
						</h2>
						<span className="text-sm text-stone-500">新しい日付順 · {entries.length}件</span>
					</div>

					{sortedEntries.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center text-sm text-stone-500">
							まだ日記はありません。最初の日記を書いてみましょう。
						</div>
					) : (
						<ul className="space-y-3">
							{sortedEntries.map((entry) => (
								<li
									key={entry.id}
									className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
								>
									<div className="mb-3 flex items-center justify-between gap-4">
										<time dateTime={entry.date} className="text-sm font-semibold text-rose-600">
											{new Date(`${entry.date}T00:00:00`).toLocaleDateString('ja-JP', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
												weekday: 'short',
											})}
										</time>
										<button
											type="button"
											onClick={() => handleDelete(entry.id)}
											aria-label={`${entry.date}の日記を削除`}
											className="shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
										>
											削除
										</button>
									</div>
									<p className="whitespace-pre-wrap break-words leading-7 text-stone-700">
										{entry.body}
									</p>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>
		</main>
	)
}

export default App
