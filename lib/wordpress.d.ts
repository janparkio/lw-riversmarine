// Common types that are reused across multiple entities
export interface PolylangMeta {
  lang: string | null;
  locale: string | null;
  translations: Record<string, number>;
}

interface WPEntity {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  link: string;
  guid: {
    rendered: string;
  };
  polylang?: PolylangMeta;
}

interface RenderedContent {
  rendered: string;
  protected: boolean;
}

interface RenderedTitle {
  rendered: string;
}

// Media types
interface MediaSize {
  file: string;
  width: number;
  height: number;
  mime_type: string;
  source_url: string;
}

interface MediaDetails {
  width: number;
  height: number;
  file: string;
  sizes: Record<string, MediaSize>;
}

export interface FeaturedMedia extends WPEntity {
  title: RenderedTitle;
  author: number;
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: MediaDetails;
  source_url: string;
}

// Content types
export interface Post extends WPEntity {
  title: RenderedTitle;
  content: RenderedContent;
  excerpt: RenderedContent;
  author: number;
  featured_media: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  sticky: boolean;
  template: string;
  format:
  | "standard"
  | "aside"
  | "chat"
  | "gallery"
  | "link"
  | "image"
  | "quote"
  | "status"
  | "video"
  | "audio";
  categories: number[];
  tags: number[];
  meta: Record<string, unknown>;
}

export interface Page extends WPEntity {
  title: RenderedTitle;
  content: RenderedContent;
  excerpt: RenderedContent;
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  template: string;
  meta: Record<string, unknown>;
}

// Vessel types
export interface ACFSelectValue {
  value: string;
  label: string;
}

export type VesselType = "towboat" | "tugboat" | "barge";

export interface VesselDimensions {
  length?: number | null;
  beam?: number | null;
  depth?: number | null;
  draft?: number | null;
  air_draft?: number | null;
}

export interface VesselCoreSpecs {
  year_built?: number | null;
  dimensions?: VesselDimensions;
  deadweight_tons?: number | null;
  classification_society?: string | null;
  length_unit?: "ft" | "m";
}

export interface VesselPropulsionPowerSpecs {
  main_engines?: string | null;
  reduction_gears?: string | null;
  horse_power?: number | null;
  total_horse_power?: number | null;
  propulsion?: ACFSelectValue | null;
}

export interface VesselBargeTankFields {
  regulated_us?: boolean;
  cargo_capacity?: {
    barrels?: number | null;
    m3_metric_tons?: string | null;
  };
  pumps?: string | null;
  cargo_tank_material?: ACFSelectValue | null;
  vapor_recovery?: ACFSelectValue | null;
  heated?: ACFSelectValue | null;
}

export interface VesselBargeSpecs {
  tank_fields?: VesselBargeTankFields | null;
}

export interface VesselFuel {
  type?: string | null;
  notes?: string | null;
  bunkering?: string | null;
}

export interface VesselSpecs {
  core_specs?: VesselCoreSpecs;
  propulsion_power_specs?: VesselPropulsionPowerSpecs;
  barge_specs?: VesselBargeSpecs;
  fuel?: VesselFuel;
}

export type CurrencyCode =
  | "usd"
  | "eur"
  | "gbp"
  | "jpy"
  | "cny"
  | "cad"
  | "aud"
  | "chf"
  | "brl"
  | "ars"
  | "mxn"
  | "clp"
  | "pen"
  | "cop"
  | "pyg"
  | "inr";

export interface VesselACF {
  vessel_type?: VesselType | null;
  barge_type?: ACFSelectValue | null;
  location?: string | null;
  condition?: ACFSelectValue | null;
  meta_description?: string | null;
  has_asking_price: boolean;
  asking_price?: number | null;
  currency: CurrencyCode;
  specs: VesselSpecs;
  gallery?: number[]; // Array of media IDs
}

export interface Vessel extends WPEntity {
  title: RenderedTitle;
  content: RenderedContent;
  featured_media: number;
  template: string;
  meta: {
    _acf_changed?: boolean;
  };
  categories: number[];
  acf: VesselACF;
}

// Taxonomy types
interface Taxonomy {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  meta: Record<string, unknown>;
}

export interface Category extends Taxonomy {
  taxonomy: "category";
  parent: number;
}

export interface Tag extends Taxonomy {
  taxonomy: "post_tag";
}

export interface Author {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: Record<string, string>;
  meta: Record<string, unknown>;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  target?: string | null;
  rel?: string | null;
  order: number;
  parentId?: string | null;
  children: MenuItem[];
}

// Block types
interface BlockSupports {
  align?: boolean | string[];
  anchor?: boolean;
  className?: boolean;
  color?: {
    background?: boolean;
    gradients?: boolean;
    text?: boolean;
  };
  spacing?: {
    margin?: boolean;
    padding?: boolean;
  };
  typography?: {
    fontSize?: boolean;
    lineHeight?: boolean;
  };
  [key: string]: unknown;
}

interface BlockStyle {
  name: string;
  label: string;
  isDefault: boolean;
}

export interface BlockType {
  api_version: number;
  title: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  keywords: string[];
  parent: string[];
  supports: BlockSupports;
  styles: BlockStyle[];
  textdomain: string;
  example: Record<string, unknown>;
  attributes: Record<string, unknown>;
  provides_context: Record<string, string>;
  uses_context: string[];
  editor_script: string;
  script: string;
  editor_style: string;
  style: string;
}

export interface EditorBlock {
  id: string;
  name: string;
  attributes: Record<string, unknown>;
  innerBlocks: EditorBlock[];
  innerHTML: string;
  innerContent: string[];
}

export interface TemplatePart {
  id: string;
  slug: string;
  theme: string;
  type: string;
  source: string;
  origin: string;
  content: string | EditorBlock[];
  title: {
    raw: string;
    rendered: string;
  };
  description: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  wp_id: number;
  has_theme_file: boolean;
  author: number;
  area: string;
}

export interface SearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
  subtype: string;
  _links: {
    self: Array<{
      embeddable: boolean;
      href: string;
    }>;
    about: Array<{
      href: string;
    }>;
  };
}

// Component Props Types
export interface FilterBarProps {
  authors: Author[];
  tags: Tag[];
  categories: Category[];
  selectedAuthor?: Author["id"];
  selectedTag?: Tag["id"];
  selectedCategory?: Category["id"];
  onAuthorChange?: (authorId: Author["id"] | undefined) => void;
  onTagChange?: (tagId: Tag["id"] | undefined) => void;
  onCategoryChange?: (categoryId: Category["id"] | undefined) => void;
}

export interface ContactFormSubmissionPayload {
  name: string;
  email: string;
  message: string;
  phone?: string;
  vesselTitle?: string;
  pageUrl?: string;
  locale?: string;
}

export interface ContactFormInvalidField {
  into: string;
  message: string;
  field: string;
}

export interface ContactFormSubmissionResponse {
  into: string;
  status: "mail_sent" | "validation_failed" | "spam" | string;
  message: string;
  posted_data_hash?: string;
  invalid_fields?: ContactFormInvalidField[];
}

export interface ContactFormDetails {
  id: number;
  title: string;
  locale: string;
  version?: string;
}

export interface ContactForm {
  id: number;
  slug: string;
  title: string;
  locale: string;
}
