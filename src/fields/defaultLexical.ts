import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  HeadingFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  lexicalEditor,
  UnderlineFeature,
} from '@payloadcms/richtext-lexical'

export const defaultLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({
      enabledCollections: ['npcs', 'locations', 'regions', 'factions', 'items', 'deities', 'characters', 'sessions'],
    }),
  ],
})
