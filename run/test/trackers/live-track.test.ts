import {
  getFixDevice,
  isEmergencyFix,
  isLowBatFix,
  isValidFix,
  LiveTrackFlag,
  Trackers,
} from 'flyxc/common/src/live-track';
import { incrementRequests, LivePoint, makeLiveTrack } from 'flyxc/run/src/trackers/live-track';

describe('makeLiveTrack', () => {
  it('should order the points in chronological order', () => {
    const points: LivePoint[] = [
      { device: Trackers.Inreach, lat: 10.123456, lon: -12.123456, alt: 100.123, timestamp: 20001, valid: false },
      { device: Trackers.Skylines, lat: 11.123456, lon: -13.123456, alt: 200.123, timestamp: 10001, valid: true },
    ];

    expect(makeLiveTrack(points)).toEqual({
      alt: [200, 100],
      extra: {},
      lat: [11.12346, 10.12346],
      lon: [-13.12346, -12.12346],
      flags: [LiveTrackFlag.Valid | Trackers.Skylines, Trackers.Inreach],
      timeSec: [10, 20],
    });
  });

  it('should keep 5 digits for lat and lon', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10.123456, lon: -12.123456, alt: 100.123, timestamp: 20001, valid: false },
    ]);

    expect(track.lat[0]).toBe(10.12346);
    expect(track.lon[0]).toBe(-12.12346);
  });

  it('should round the altitude', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10.123456, lon: -12.123456, alt: 100.123, timestamp: 20001, valid: false },
    ]);

    expect(track.alt[0]).toBe(100);
  });

  it('should convert the timestamp to seconds', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10.123456, lon: -12.123456, alt: 100.123, timestamp: 20001, valid: false },
    ]);

    expect(track.timeSec[0]).toBe(20);
  });

  it('should not add extra when not required', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10.123456, lon: -12.123456, alt: 100.123, timestamp: 20001, valid: false },
    ]);

    expect(track.extra).toEqual({});
  });

  it('should add extra for speed with a single digit', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 1000, valid: false },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000, valid: false, speed: 10.123 },
    ]);

    expect(track.extra).toEqual({ 1: { speed: 10.1 } });
  });

  it('should add extra for messages', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 1000, valid: false },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000, valid: false, message: 'hello' },
    ]);

    expect(track.extra).toEqual({ 1: { message: 'hello' } });
  });

  it('should encode valid', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 1000, valid: false },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000, valid: true },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000, valid: null },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000 },
    ]);

    expect(track.flags.map((flags) => isValidFix(flags))).toEqual([false, true, true, true]);
  });

  it('should encode emergency', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 1000, emergency: true },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000, emergency: false },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000, emergency: null },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000 },
    ]);

    expect(track.flags.map((flags) => isEmergencyFix(flags))).toEqual([true, false, false, false]);
  });

  it('should encode low battery', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 1000, lowBattery: true },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000, lowBattery: false },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000, lowBattery: null },
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 2000 },
    ]);

    expect(track.flags.map((flags) => isLowBatFix(flags))).toEqual([true, false, false, false]);
  });

  it('should encode the device', () => {
    const track = makeLiveTrack([
      { device: Trackers.Inreach, lat: 10, lon: -12, alt: 100, timestamp: 1000 },
      { device: Trackers.Spot, lat: 10, lon: -12, alt: 100, timestamp: 2000 },
      { device: Trackers.Skylines, lat: 10, lon: -12, alt: 100, timestamp: 2000 },
    ]);

    expect(track.flags.map((flags) => getFixDevice(flags))).toEqual([
      Trackers.Inreach,
      Trackers.Spot,
      Trackers.Skylines,
    ]);
  });
});

describe('incrementRequests', () => {
  it('should support undefined', () => {
    expect(incrementRequests(undefined, { isError: false })).toEqual(1);
    expect(incrementRequests(undefined, { isError: true })).toEqual(1001);
  });

  it('should increment requests', () => {
    expect(incrementRequests(0, { isError: false })).toEqual(1);
    expect(incrementRequests(100, { isError: false })).toEqual(101);
    expect(incrementRequests(50123, { isError: false })).toEqual(50124);
  });

  it('should increment errors', () => {
    expect(incrementRequests(0, { isError: true })).toEqual(1001);
    expect(incrementRequests(10123, { isError: true })).toEqual(11124);
    expect(incrementRequests(50001, { isError: true })).toEqual(51002);
  });

  it('should divide count by 2 on overflow', () => {
    expect(incrementRequests(999, { isError: false })).toEqual(500);
    expect(incrementRequests(100999, { isError: false })).toEqual(50500);
    expect(incrementRequests(999001, { isError: true })).toEqual(500001);
    expect(incrementRequests(999100, { isError: true })).toEqual(500050);
    expect(incrementRequests(999999, { isError: true })).toEqual(500500);
  });
});
