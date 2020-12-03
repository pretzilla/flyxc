// @generated by protobuf-ts 1.0.8 with parameters force_optimize_code_size
// @generated from protobuf file "track.proto" (syntax proto3)
// tslint:disable
import { MessageType } from "@protobuf-ts/runtime";
/**
 * A single track.
 * Fixes are differential encoded.
 *
 * @generated from protobuf message Track
 */
export interface Track {
    /**
     * @generated from protobuf field: string pilot = 1;
     */
    pilot: string;
    /**
     * @generated from protobuf field: repeated sint32 lat = 2;
     */
    lat: number[];
    /**
     * @generated from protobuf field: repeated sint32 lon = 3;
     */
    lon: number[];
    /**
     * @generated from protobuf field: repeated sint32 alt = 4;
     */
    alt: number[];
    /**
     * @generated from protobuf field: repeated uint32 ts = 5;
     */
    ts: number[];
}
/**
 * All the tracks for a single file.
 * Stored in the database.
 *
 * @generated from protobuf message TrackGroup
 */
export interface TrackGroup {
    /**
     * @generated from protobuf field: repeated Track tracks = 2;
     */
    tracks: Track[];
}
/**
 * Ground altitude for a single Track.
 *
 * @generated from protobuf message GroundAltitude
 */
export interface GroundAltitude {
    /**
     * @generated from protobuf field: repeated sint32 altitudes = 1;
     */
    altitudes: number[];
    /**
     * True when errors were encountered while retrieveing the altitudes.
     *
     * @generated from protobuf field: bool has_errors = 2;
     */
    hasErrors: boolean;
}
/**
 * Ground altitude for a Track group.
 * Stored in the database.
 *
 * @generated from protobuf message GroundAltitudeGroup
 */
export interface GroundAltitudeGroup {
    /**
     * @generated from protobuf field: repeated GroundAltitude ground_altitudes = 1;
     */
    groundAltitudes: GroundAltitude[];
}
/**
 * Airspaces along a track.
 *
 * @generated from protobuf message Airspaces
 */
export interface Airspaces {
    /**
     * @generated from protobuf field: repeated sint32 start_ts = 1;
     */
    startTs: number[];
    /**
     * @generated from protobuf field: repeated sint32 end_ts = 2;
     */
    endTs: number[];
    /**
     * @generated from protobuf field: repeated string name = 3;
     */
    name: string[];
    /**
     * @generated from protobuf field: repeated string category = 4;
     */
    category: string[];
    /**
     * @generated from protobuf field: repeated sint32 top = 5;
     */
    top: number[];
    /**
     * @generated from protobuf field: repeated sint32 bottom = 6;
     */
    bottom: number[];
    /**
     * @generated from protobuf field: repeated uint32 flags = 7;
     */
    flags: number[];
    /**
     * @generated from protobuf field: bool has_errors = 8;
     */
    hasErrors: boolean;
}
/**
 * @generated from protobuf message AirspacesGroup
 */
export interface AirspacesGroup {
    /**
     * @generated from protobuf field: repeated Airspaces airspaces = 1;
     */
    airspaces: Airspaces[];
}
/**
 * @generated from protobuf message MetaTrackGroup
 */
export interface MetaTrackGroup {
    /**
     * @generated from protobuf field: int64 id = 1 [jstype = JS_STRING];
     */
    id: number;
    /**
     * @generated from protobuf field: uint32 num_postprocess = 2;
     */
    numPostprocess: number;
    /**
     * @generated from protobuf field: optional bytes track_group_bin = 3;
     */
    trackGroupBin?: Uint8Array;
    /**
     * This field is only present when there are some altitude data.
     * The GroundAltitude can still have has_errors = true if not all the data
     * were retrieved correctly.
     *
     * @generated from protobuf field: optional bytes ground_altitude_group_bin = 4;
     */
    groundAltitudeGroupBin?: Uint8Array;
    /**
     * @generated from protobuf field: optional bytes airspaces_group_bin = 5;
     */
    airspacesGroupBin?: Uint8Array;
}
/**
 * @generated from protobuf message MetaTracks
 */
export interface MetaTracks {
    /**
     * @generated from protobuf field: repeated bytes meta_track_groups_bin = 1;
     */
    metaTrackGroupsBin: Uint8Array[];
}
/**
 * Type for protobuf message Track
 */
class Track$Type extends MessageType<Track> {
    constructor() {
        super("Track", [
            { no: 1, name: "pilot", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "lat", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 17 /*ScalarType.SINT32*/ },
            { no: 3, name: "lon", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 17 /*ScalarType.SINT32*/ },
            { no: 4, name: "alt", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 17 /*ScalarType.SINT32*/ },
            { no: 5, name: "ts", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
export const Track = new Track$Type();
/**
 * Type for protobuf message TrackGroup
 */
class TrackGroup$Type extends MessageType<TrackGroup> {
    constructor() {
        super("TrackGroup", [
            { no: 2, name: "tracks", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Track }
        ]);
    }
}
export const TrackGroup = new TrackGroup$Type();
/**
 * Type for protobuf message GroundAltitude
 */
class GroundAltitude$Type extends MessageType<GroundAltitude> {
    constructor() {
        super("GroundAltitude", [
            { no: 1, name: "altitudes", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 17 /*ScalarType.SINT32*/ },
            { no: 2, name: "has_errors", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
}
export const GroundAltitude = new GroundAltitude$Type();
/**
 * Type for protobuf message GroundAltitudeGroup
 */
class GroundAltitudeGroup$Type extends MessageType<GroundAltitudeGroup> {
    constructor() {
        super("GroundAltitudeGroup", [
            { no: 1, name: "ground_altitudes", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => GroundAltitude }
        ]);
    }
}
export const GroundAltitudeGroup = new GroundAltitudeGroup$Type();
/**
 * Type for protobuf message Airspaces
 */
class Airspaces$Type extends MessageType<Airspaces> {
    constructor() {
        super("Airspaces", [
            { no: 1, name: "start_ts", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 17 /*ScalarType.SINT32*/ },
            { no: 2, name: "end_ts", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 17 /*ScalarType.SINT32*/ },
            { no: 3, name: "name", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "category", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "top", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 17 /*ScalarType.SINT32*/ },
            { no: 6, name: "bottom", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 17 /*ScalarType.SINT32*/ },
            { no: 7, name: "flags", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 13 /*ScalarType.UINT32*/ },
            { no: 8, name: "has_errors", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
}
export const Airspaces = new Airspaces$Type();
/**
 * Type for protobuf message AirspacesGroup
 */
class AirspacesGroup$Type extends MessageType<AirspacesGroup> {
    constructor() {
        super("AirspacesGroup", [
            { no: 1, name: "airspaces", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Airspaces }
        ]);
    }
}
export const AirspacesGroup = new AirspacesGroup$Type();
/**
 * Type for protobuf message MetaTrackGroup
 */
class MetaTrackGroup$Type extends MessageType<MetaTrackGroup> {
    constructor() {
        super("MetaTrackGroup", [
            { no: 1, name: "id", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 2, name: "num_postprocess", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 3, name: "track_group_bin", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 4, name: "ground_altitude_group_bin", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 5, name: "airspaces_group_bin", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
export const MetaTrackGroup = new MetaTrackGroup$Type();
/**
 * Type for protobuf message MetaTracks
 */
class MetaTracks$Type extends MessageType<MetaTracks> {
    constructor() {
        super("MetaTracks", [
            { no: 1, name: "meta_track_groups_bin", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
export const MetaTracks = new MetaTracks$Type();
