import type { Field } from 'payload'

const slugify = (input: string): string =>
  input
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const slugField = (sourceField: string = 'name'): Field[] => [
  {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description: 'Auto-generated from name; edit only if you know what you are doing.',
    },
    hooks: {
      beforeValidate: [
        ({ data, value }) => {
          if (typeof value === 'string' && value.length > 0) return slugify(value)
          const source = data?.[sourceField]
          return typeof source === 'string' ? slugify(source) : value
        },
      ],
    },
  },
]
