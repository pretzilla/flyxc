import { Datastore, Key } from '@google-cloud/datastore';

// Get the numeric id of an entity from its key.
// TODO: check where need to use
// TODO: should it be from Tracker instead ? check use
export function idFromKey(key: Key): number {
  return Number(key.id);
}

// TODO: use this function, see above
export function idFromEntity<T extends { [Datastore.KEY]: Key }>(entity: T): number {
  return Number(entity[Datastore.KEY].id);
}
