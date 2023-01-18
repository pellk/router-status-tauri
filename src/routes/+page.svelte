<script lang="ts">
import fetchConnection from '$lib/connection';
import fetchWifi from '$lib/wifi';
import knownDevices from '$lib/knownDevices';

const MAX_HISTOGRAM_COLS = 24;

const MINIMUM = 2.5;
let snr: number;
let downStream: number;
// let downAudio: HTMLAudioElement;
// let upAudio: HTMLAudioElement;
let connectionStarted = false;
let wifiStarted = false;
let down = false;

async function getConnection() {
	const result = await fetchConnection();
	downStream = result.downStream;
	if (snr !== result.snr) {
		snr = result.snr;
		if (snr < MINIMUM) {
			if (!down) {
				down = true;
				// downAudio?.play();
			}
		} else {
			if (down) {
				down = false;
				// upAudio?.play();
			}
		}
	}
}

let wifiHistory: Record<string, number[]> = {};
let lastPackets: Record<string, number>;

async function getWifi() {
	const result = await fetchWifi();
	for (const mac in result) {
		if (!(mac in wifiHistory)) wifiHistory[mac] = [];
		wifiHistory[mac].push(Math.ceil((result[mac] - lastPackets[mac]) / 100));
		if (wifiHistory[mac].length > MAX_HISTOGRAM_COLS)
			wifiHistory[mac].splice(0, wifiHistory[mac].length - MAX_HISTOGRAM_COLS);
	}
	for (const mac in wifiHistory) {
		if (!(mac in result)) delete wifiHistory[mac];
	}
	lastPackets = result;
	wifiHistory = wifiHistory;
}

function startConnection() {
	// downAudio = new Audio('fail.ogg');
	// upAudio = new Audio('positive.ogg');
	getConnection();
	setInterval(getConnection, 5000);
	connectionStarted = true;
}

async function startWifi() {
	lastPackets = await fetchWifi();
	setInterval(getWifi, 5000);
	wifiStarted = true;
}
</script>

<!-- <svelte:head>
	<link rel="icon" type="image/png" href="/{down ? 'red' : 'green'}.png" />
	<title>{downStream} mbps</title>
</svelte:head> -->

<main>
	<section>
		{#if !connectionStarted}
			<button type="button" on:click={startConnection}>Start</button>
		{/if}
		<dl class:down>
			<dt>SNR Margin</dt>
			<dd>{snr ?? ''}</dd>
		</dl>
		<dl>
			<dt>Down Stream</dt>
			<dd>{downStream} mbps</dd>
		</dl>
	</section>
	<section>
		{#if !wifiStarted}
			<button type="button" on:click={startWifi}>Start</button>
		{/if}
		<div class="wifi-history">
			{#each Object.entries(wifiHistory) as [mac, packets]}
				<div class="mac">{knownDevices[mac] ?? mac}</div>
				<div class="histogram">
					{#each packets as p}
						<div class="column" style:height="{p}px" />
					{/each}
				</div>
			{/each}
		</div>
	</section>
</main>

<style>
main {
	display: flex;
	gap: 1em;
	padding: 1em;
}
.down {
	color: darkred;
}

.wifi-history {
	display: grid;
	grid-template-columns: auto 280px;
	justify-content: start;
}
.wifi-history > * {
	padding: 0.5em;
	box-sizing: border-box;
}
.wifi-history .histogram {
	display: flex;
	gap: 1px;
	justify-content: end;
	align-items: flex-end;
}
.wifi-history .mac:nth-child(4n - 1),
.wifi-history .histogram:nth-child(4n) {
	background-color: #1a1a1a;
}
.histogram .column {
	width: 10px;
	background-color: darkgreen;
}
</style>
