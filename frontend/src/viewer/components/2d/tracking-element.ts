import { LiveTrack } from 'flyxc/common/protos/live-track';
import {
  getFixDevice,
  getFixMessage,
  isEmergencyFix,
  isLowBatFix,
  isValidFix,
  trackerDisplayNames,
} from 'flyxc/common/src/live-track';
import {
  CSSResult,
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
} from 'lit-element';
import { connect } from 'pwa-helpers';

import { formatUnit, Units } from '../../logic/units';
import { setDisplayLiveNames } from '../../redux/app-slice';
import { liveTrackSelectors, updateTrackers } from '../../redux/live-track-slice';
import { RootState, store } from '../../redux/store';
import { getUniqueColor } from '../../styles/track';
import { controlStyle } from '../control-style';

// Anchors and label origins for markers.
let ANCHOR_POSITION: google.maps.Point | undefined;
let ANCHOR_ARROW: google.maps.Point | undefined;
let ORIGIN_ARROW: google.maps.Point | undefined;
let ANCHOR_MSG: google.maps.Point | undefined;
let ORIGIN_MSG: google.maps.Point | undefined;

// A track is considered recent if ended less than timeout ago.
const RECENT_TIMEOUT_MIN = 2 * 60;

const positionSvg = (color: string, opacity: number): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" height="9" width="9">` +
  `<circle r="3" cx="4" cy="4" fill="${color}" stroke="black" stroke-width="1" opacity="${opacity}"/>` +
  `</svg>`;

const arrowSvg = (angle: number, color: string, opacity: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" height="19" width="19">` +
  `<path d='M9 3 l-5 13 l5 -3 l5 3z' fill="${color}" stroke="black" stroke-width="1"` +
  ` transform="rotate(${angle}, 9, 9)"  opacity="${opacity}"/>` +
  `</svg>`;

const msgSvg = (color: string, opacity: number): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16">` +
  `<path fill="${color}" stroke="black" stroke-width="1" opacity="${opacity}"` +
  ` d="M2.5 2C1.7 2 1 2.7 1 3.5 l 0 8 c0 .8.7 1.5 1.5 1.5 H4 l 0 2.4 L 7.7 13 l 4.8 0 c.8 0 1.5 -.7 1.5 -1.5 l 0 -8 c 0 -.8 -.7 -1.5 -1.5 -1.5 z"/>` +
  `</svg>`;

@customElement('tracking-element')
export class TrackingElement extends connect(store)(LitElement) {
  // Actual type: google.maps.Map.
  @property()
  map: any;

  private get gMap(): google.maps.Map {
    return this.map;
  }

  @internalProperty()
  private isVisible = false;

  @internalProperty()
  private displayNames = true;

  @internalProperty()
  private geojson: any;

  private units?: Units;
  private info?: google.maps.InfoWindow;
  // Name of the pilot shown in the info window.
  private currentId?: number;
  private features: google.maps.Data.Feature[] = [];
  private fetchTimer?: number;

  connectedCallback(): void {
    super.connectedCallback();
    // At this point the api has been loaded.
    ANCHOR_POSITION = new google.maps.Point(4, 4);
    ANCHOR_ARROW = new google.maps.Point(9, 9);
    ORIGIN_ARROW = new google.maps.Point(9, 36);
    ANCHOR_MSG = new google.maps.Point(7, 9);
    ORIGIN_MSG = new google.maps.Point(0, 22);
    this.setMapStyle(this.gMap);
    this.setupInfoWindow(this.gMap);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.fetchTimer != null) {
      clearInterval(this.fetchTimer);
      this.fetchTimer = undefined;
    }
  }

  shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has('isVisible')) {
      if (this.isVisible) {
        if (this.fetchTimer == null) {
          store.dispatch(updateTrackers());
          this.fetchTimer = window.setInterval(() => store.dispatch(updateTrackers()), 2 * 60 * 1000);
        }
      } else {
        if (this.fetchTimer != null) {
          clearInterval(this.fetchTimer);
          this.fetchTimer = undefined;
        }
      }
      changedProps.delete('isVisible');
    }
    if (changedProps.has('geojson')) {
      const features = this.features;
      this.features = this.gMap.data.addGeoJson(this.geojson) || [];
      features.forEach((f) => this.gMap.data.remove(f));
      changedProps.delete('geojson');
    }
    return super.shouldUpdate(changedProps);
  }

  stateChanged(state: RootState): void {
    this.units = state.units;
    this.displayNames = state.app.displayLiveNames;
    this.isVisible = state.browser.isVisible;
    this.geojson = state.liveTrack.geojson;
  }

  static get styles(): CSSResult {
    return controlStyle;
  }

  private setupInfoWindow(map: google.maps.Map): void {
    this.info = new google.maps.InfoWindow();
    this.info.close();
    this.info.addListener('closeclick', () => {
      this.currentId = undefined;
      this.setMapStyle(this.gMap);
    });

    map.data.addListener('click', (event) => {
      const feature: google.maps.Data.Feature | undefined = event.feature;
      if (feature?.getGeometry().getType() == 'Point') {
        const id = Number(feature.getProperty('id') ?? 0);
        const track = liveTrackSelectors.selectById(store.getState(), id) as LiveTrack;
        const index = feature.getProperty('index') ?? 0;
        const message = getFixMessage(track, index);
        const flags = track.flags[index];
        const alt = track.alt[index];
        const speed = track.extra[index]?.speed;
        const date = new Date(track.timeSec[index] * 1000);

        const content: string[] = [
          `<strong>${track.name}</strong>`,
          `<i class="las la-clock"></i> ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
          `<i class="las la-arrow-up"></i> ${formatUnit(alt, this.units?.altitude)}`,
        ];
        if (speed != null) {
          content.push(`<i class="las la-tachometer-alt"></i> ${formatUnit(speed, this.units?.speed)}`);
        }
        content.push(
          `<i class="las la-map-marked"></i> <a href=${`https://www.google.com/maps/dir//${track.lat[index]},${track.lon[index]}`} target="_blank">Directions</a>`,
        );
        if (message != null) {
          content.push(`<i class="las la-sms"></i> “${message}”`);
        }
        if (isEmergencyFix(flags)) {
          content.push('<i class="las la-first-aid"></i> <strong>Emergency</strong>');
        }
        if (isLowBatFix(flags)) {
          content.push('<i class="las la-battery-empty"></i> Low Battery.');
        }
        if (!isValidFix(flags)) {
          content.push(
            '<i class="las la-exclamation-circle"></i> <strong>Warning</strong>',
            'The GPS fix is reported as invalid.',
            'The actual location might be different.',
          );
        }
        content.push(`<i class="las la-satellite-dish"></i> ${trackerDisplayNames[getFixDevice(flags)]}`);

        if (this.info) {
          this.info.setContent(content.join('<br>'));
          this.info.setPosition(event.latLng);
          this.info.open(map);
          this.currentId = id;
          this.setMapStyle(this.gMap);
        }
      }
    });
  }

  private setMapStyle(map: google.maps.Map): void {
    map.data.setStyle(
      (feature: google.maps.Data.Feature): google.maps.Data.StyleOptions => {
        switch (feature.getGeometry().getType()) {
          case 'Point':
            return this.getPointStyle(feature);
          case 'LineString':
            return this.getTrackStyle(feature);
          default:
            return {};
        }
      },
    );
  }

  // Using data-url with icon is much faster than using symbols.
  private getPointStyle(feature: google.maps.Data.Feature): google.maps.Data.StyleOptions {
    const nowSec = Date.now() / 1000;
    const id = Number(feature.getProperty('id') ?? 0);
    const track = liveTrackSelectors.selectById(store.getState(), id) as LiveTrack;
    const index = feature.getProperty('index') ?? 0;
    const message = getFixMessage(track, index);
    const isEmergency = isEmergencyFix(track.flags[index]);
    const heading = feature.getProperty('heading');

    const ageMin = Math.round((nowSec - (track?.timeSec[index] ?? 0)) / 60);

    let opacity = ageMin > RECENT_TIMEOUT_MIN ? 0.3 : 0.9;
    const color = getUniqueColor(Math.round(id / 1000));
    let labelColor = 'black';
    let svg: string | undefined;
    let labelOrigin: google.maps.Point | undefined;
    let anchor: google.maps.Point | undefined;
    let zIndex = 10;

    if (id === this.currentId) {
      opacity = 0.9;
      labelColor = 'darkred';
      zIndex = 20;
    }

    let label: google.maps.MarkerLabel | undefined;
    // Display an arrow when we have a bearing (most recent point).
    if (heading != null) {
      anchor = ANCHOR_ARROW;
      labelOrigin = ORIGIN_ARROW;
      svg = arrowSvg(heading, color, opacity);
      // Display the pilot name.
      if (this.displayNames && (id === this.currentId || ageMin < 12 * 60)) {
        const age = ageMin < 60 ? `${ageMin}min` : `${Math.floor(ageMin / 60)}h${String(ageMin % 60).padStart(2, '0')}`;
        label = {
          color: labelColor,
          text: track.name + '\n-' + age,
          className: 'gm-label-outline',
        } as any;
      }
    }

    // Display speech bubble for messages and emergency.
    if (message) {
      anchor = ANCHOR_MSG;
      labelOrigin = ORIGIN_MSG;
      svg = msgSvg('yellow', opacity);
      zIndex = 50;
    }

    if (isEmergency) {
      anchor = ANCHOR_MSG;
      labelOrigin = ORIGIN_MSG;
      svg = msgSvg('red', 1);
      zIndex = 60;
    }

    // Simple dots for every other positions.
    if (svg == null) {
      svg = positionSvg(color, opacity);
      anchor = ANCHOR_POSITION;
    }

    return {
      label,
      zIndex,
      cursor: 'zoom-in',
      icon: {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        anchor,
        labelOrigin,
      },
    } as google.maps.Data.StyleOptions;
  }

  private getTrackStyle(feature: google.maps.Data.Feature): google.maps.Data.StyleOptions {
    const nowSec = Date.now() / 1000;
    const id = feature.getProperty('id') as number;
    const track = liveTrackSelectors.selectById(store.getState(), id) as LiveTrack;
    const endIdx = feature.getProperty('endIndex');
    const ageMin = (nowSec - track.timeSec[endIdx]) / 60;

    const strokeColor = getUniqueColor(Math.round(id / 1000));
    let strokeWeight = 1;
    let zIndex = 10;

    if (id == this.currentId) {
      strokeWeight = 4;
    } else if (ageMin < RECENT_TIMEOUT_MIN) {
      strokeWeight = 2;
      zIndex = 15;
    }

    return {
      strokeColor,
      strokeWeight,
      zIndex,
    };
  }

  protected render(): TemplateResult {
    return html`
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/line-awesome@1/dist/line-awesome/css/line-awesome.min.css"
      />
      <label
        ><input type="checkbox" ?checked=${this.displayNames} @change=${this.handleDisplayNames} /><i
          class="la la-user-tag la-2x"
        ></i
      ></label>
      <i
        class="la la-satellite-dish la-2x"
        style="cursor: pointer"
        @click=${(): void => void (document.location.href = '/devices.html')}
      ></i>
    `;
  }

  private handleDisplayNames(e: Event): void {
    store.dispatch(setDisplayLiveNames((e.target as HTMLInputElement).checked));
    // The style depends on displayNames.
    this.setMapStyle(this.gMap);
  }
}
