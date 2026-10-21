export type BlockType =
  | "title"
  | "paragraph"
  | "list"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "social"
  | "html"
  | "video"
  | "icons"
  | "menu"
  | "table";

export type RowLayout =
  | "1-col"
  | "2-col-equal"
  | "2-col-33-67"
  | "2-col-67-33"
  | "2-col-25-75"
  | "2-col-75-25"
  | "3-col-equal"
  | "4-col-equal";

export interface EmailDesignSettings {
  contentWidth: number; // e.g. 600
  contentAlign: "left" | "center";
  backgroundColor: string; // page background e.g. #f4f4f7
  contentBackgroundColor: string; // inner container e.g. #ffffff
  backgroundImage?: string;
  defaultFont: string; // e.g. Arial, Helvetica, sans-serif
  linkColor: string; // e.g. #1c472a
  language: string; // e.g. en
}

export interface TitleBlockContent {
  text: string;
  level: "h1" | "h2" | "h3";
  align: "left" | "center" | "right";
  color: string;
  fontSize: number; // e.g. 28
  lineHeight: number; // e.g. 1.3
  fontWeight: "normal" | "bold" | "600" | "800";
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface ParagraphBlockContent {
  text: string;
  align: "left" | "center" | "right" | "justify";
  color: string;
  fontSize: number; // e.g. 15
  lineHeight: number; // e.g. 1.6
  fontWeight: "normal" | "bold" | "500";
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface ListBlockContent {
  items: string[];
  listType: "bullet" | "numbered";
  color: string;
  fontSize: number;
  lineHeight: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface ImageBlockContent {
  url: string;
  alt: string;
  linkUrl?: string;
  widthPercent: number; // 20 to 100%
  align: "left" | "center" | "right";
  borderRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface ButtonBlockContent {
  text: string;
  url: string;
  backgroundColor: string;
  textColor: string;
  align: "left" | "center" | "right";
  borderRadius: number; // 0 for square, 6 for rounded, 9999 for pill
  fontSize: number;
  fontWeight: "normal" | "bold" | "600";
  fullWidth: boolean;
  paddingVertical: number;
  paddingHorizontal: number;
  paddingTop: number;
  paddingBottom: number;
}

export interface DividerBlockContent {
  height: number; // line thickness e.g. 1
  style: "solid" | "dashed" | "dotted";
  color: string;
  widthPercent: number; // e.g. 100%
  align: "left" | "center" | "right";
  paddingTop: number;
  paddingBottom: number;
}

export interface SpacerBlockContent {
  height: number; // px e.g. 30
}

export interface SocialNetwork {
  network: "facebook" | "instagram" | "x" | "whatsapp" | "website" | "linkedin";
  url: string;
}

export interface SocialBlockContent {
  networks: SocialNetwork[];
  align: "left" | "center" | "right";
  iconSize: number; // e.g. 24
  iconStyle: "color" | "dark" | "outline";
  spacing: number;
  paddingTop: number;
  paddingBottom: number;
}

export interface HtmlBlockContent {
  code: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface VideoBlockContent {
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  align: "left" | "center" | "right";
  paddingTop: number;
  paddingBottom: number;
}

export interface MenuBlockContent {
  items: { label: string; url: string }[];
  align: "left" | "center" | "right";
  fontSize: number;
  color: string;
  paddingTop: number;
  paddingBottom: number;
}

export interface TableBlockContent {
  rows: string[][]; // headers and cells
  hasHeader: boolean;
  borderColor: string;
  textColor: string;
  paddingTop: number;
  paddingBottom: number;
}

export type BlockContentMap = {
  title: TitleBlockContent;
  paragraph: ParagraphBlockContent;
  list: ListBlockContent;
  image: ImageBlockContent;
  button: ButtonBlockContent;
  divider: DividerBlockContent;
  spacer: SpacerBlockContent;
  social: SocialBlockContent;
  html: HtmlBlockContent;
  video: VideoBlockContent;
  icons: SocialBlockContent;
  menu: MenuBlockContent;
  table: TableBlockContent;
};

export interface EmailBlock<T extends BlockType = BlockType> {
  id: string;
  type: T;
  content: BlockContentMap[T];
}

export interface ColumnSettings {
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  verticalAlign: "top" | "middle" | "bottom";
}

export interface EmailColumn {
  id: string;
  widthPercent: number; // sum in a row = 100
  blocks: EmailBlock[];
  settings: ColumnSettings;
}

export interface RowSettings {
  backgroundColor?: string; // full row width background
  contentBackgroundColor?: string; // inner container background
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  hideOnMobile?: boolean;
}

export interface EmailRow {
  id: string;
  layout: RowLayout;
  columns: EmailColumn[];
  settings: RowSettings;
}

export interface EmailDocument {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subject: string;
  preheader: string;
  settings: EmailDesignSettings;
  rows: EmailRow[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailDesignerTemplateRecord {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subject: string;
  preheader: string;
  design: EmailDocument;
  html_content: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}
