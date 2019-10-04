import('./jszip.min.js');
import('./filesaver.js');

var vm = new Vue({
	el: '#app',
	data() {
		return {
			ads: [
				{
					width: 320,
					height: 250,
					video: '',
					image: '',
					id: this.idGenerator()
				},
				{
					width: 320,
					height: 400,
					video: '',
					image: '',
					id: this.idGenerator()
				},
				{
					width: 580,
					height: 400,
					video: '',
					image: '',
					id: this.idGenerator()
				},
				{
					width: 980,
					height: 500,
					video: '',
					image: '',
					id: this.idGenerator()
				},
				{
					width: 980,
					height: 600,
					video: '',
					image: '',
					id: this.idGenerator()
				},
				{
					width: 980,
					height: 300,
					video: '',
					image: '',
					id: this.idGenerator()
				}
			],
			landingPage: '',
			projectName: '',
			manifest: {},
			htmlText: '',
			newW: 0,
			newH: 0,
			showWarning: false,
			warning: ''
		};
	},
	created() {
		fetch('manifest.json')
			.then(blob => blob.json())
			.then(json => {
				this.manifest = JSON.stringify(json);
			});
		fetch('html.txt')
			.then(blob => blob.text())
			.then(txt => {
				this.htmlText = txt;
			});
	},
	methods: {
		remove(index) {
			this.ads.splice(index, 1);
		},
		setFile(event, ad) {
			ad.image = event.target.files[0];
		},
		download() {
			if (this.landingPage.length < 1 || this.projectName.length < 1) {
				this.warning = `Mangler enten prosjektnavn eller landingsside 👓`;
				this.showWarning = true;
				return;
			} else {
				this.showWarning = false;
			}
			this.ads
				.filter(ad => {
					return ad.video.length > 0;
				})
				.map(ad => {
					let zip = new JSZip();

					if (ad.image) {
						var videoStr = `<video muted loop autoplay src="${ad.video}" poster="${ad.image.name}"></video>`;
						zip.file(ad.image.name, ad.image);
					} else {
						var videoStr = `<video muted loop autoplay src="${ad.video}" ></video>`;
					}
					var htmlVideo = this.htmlText.replace(
						'<!--VIDEO-->',
						videoStr
					);
					htmlVideo = htmlVideo.replace(
						'<!--CLICKTAG1-->',
						this.landingPage
					);
					htmlVideo = htmlVideo.replace(
						'<!--CLICKTAG2-->',
						this.landingPage
					);
					zip.file('index.html', htmlVideo);

					var adManifest = JSON.parse(this.manifest);
					adManifest.width = ad.width;
					adManifest.height = ad.height;
					adManifest.clicktags.clickTAG = this.landingPage;

					zip.file('manifest.json', JSON.stringify(adManifest));

					zip.generateAsync({ type: 'blob' }).then(blob => {
						saveAs(
							blob,
							`${this.projectName} – ${ad.width}x${ad.height}.zip`
						);
					});
				});
		},
		newSize(event) {
			if (!this.newW || !this.newH) {
				console.warn('Skriv inn både bredde og høyde');
				return;
			}
			this.ads.push({
				width: this.newW,
				height: this.newH,
				video: '',
				image: '',
				id: this.idGenerator()
			});
		},
		idGenerator() {
			return (
				'R' +
				Math.random()
					.toString(36)
					.substr(2, 9) +
				Math.random()
					.toString(36)
					.substr(2, 9)
			);
		}
	}
});
