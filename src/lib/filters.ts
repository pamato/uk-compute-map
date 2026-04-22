import {
  AccessTypeSchema,
  CategorySchema,
  HardwareTagSchema,
  ITL1Schema,
  NationSchema,
  StatusSchema,
  type AccessType,
  type Category,
  type Facility,
  type HardwareTag,
  type ITL1,
  type Nation,
  type Status,
} from '../data/schema';

export interface FilterState {
  categories?: Category[];
  statuses?: Status[];
  nations?: Nation[];
  itl1?: ITL1[];
  accessTypes?: AccessType[];
  hardwareTags?: HardwareTag[];
  funders?: string[];
}

const PARAM_TO_FIELD: Record<string, keyof FilterState> = {
  category: 'categories',
  status: 'statuses',
  nation: 'nations',
  itl1: 'itl1',
  access: 'accessTypes',
  hardware: 'hardwareTags',
  funder: 'funders',
};

const FIELD_TO_PARAM: Record<keyof FilterState, string> = {
  categories: 'category',
  statuses: 'status',
  nations: 'nation',
  itl1: 'itl1',
  accessTypes: 'access',
  hardwareTags: 'hardware',
  funders: 'funder',
};

export function applyFilters(facilities: Facility[], state: FilterState): Facility[] {
  return facilities.filter((facility) => {
    if (state.categories?.length && !state.categories.includes(facility.category)) {
      return false;
    }

    if (state.statuses?.length && !state.statuses.includes(facility.status)) {
      return false;
    }

    if (state.nations?.length && !state.nations.includes(facility.location.nation)) {
      return false;
    }

    if (state.itl1?.length && !state.itl1.includes(facility.location.itl1)) {
      return false;
    }

    if (
      state.accessTypes?.length &&
      !state.accessTypes.includes(facility.access.accessType)
    ) {
      return false;
    }

    if (state.funders?.length && !state.funders.includes(facility.funder)) {
      return false;
    }

    if (
      state.hardwareTags?.length &&
      !facility.hardwareTags.some((tag) => state.hardwareTags?.includes(tag))
    ) {
      return false;
    }

    return true;
  });
}

export function filtersFromSearchParams(params: URLSearchParams): FilterState {
  const state: FilterState = {};

  for (const [param, rawValue] of params.entries()) {
    const field = PARAM_TO_FIELD[param];
    if (!field) {
      continue;
    }

    const values = rawValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!values.length) {
      continue;
    }

    switch (field) {
      case 'categories':
        assignIfAny(state, field, parseEnumValues(values, CategorySchema));
        break;
      case 'statuses':
        assignIfAny(state, field, parseEnumValues(values, StatusSchema));
        break;
      case 'nations':
        assignIfAny(state, field, parseEnumValues(values, NationSchema));
        break;
      case 'itl1':
        assignIfAny(state, field, parseEnumValues(values, ITL1Schema));
        break;
      case 'accessTypes':
        assignIfAny(state, field, parseEnumValues(values, AccessTypeSchema));
        break;
      case 'hardwareTags':
        assignIfAny(state, field, parseEnumValues(values, HardwareTagSchema));
        break;
      case 'funders':
        assignIfAny(state, field, values);
        break;
    }
  }

  return state;
}

export function filtersToSearchParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  for (const field of Object.keys(FIELD_TO_PARAM) as (keyof FilterState)[]) {
    const values = state[field];

    if (Array.isArray(values) && values.length > 0) {
      params.set(FIELD_TO_PARAM[field], values.join(','));
    }
  }

  return params;
}

function parseEnumValues<T>(
  values: string[],
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T } },
): T[] {
  return values.flatMap((value) => {
    const result = schema.safeParse(value);
    return result.success ? [result.data as T] : [];
  });
}

function assignIfAny<K extends keyof FilterState>(
  state: FilterState,
  field: K,
  values: NonNullable<FilterState[K]>,
) {
  if (values.length > 0) {
    state[field] = values;
  }
}
