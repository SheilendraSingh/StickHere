"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Button from "@/components/common/Button";
import AttachmentMenu, { type AttachmentType } from "@/components/media/AttachmentMenu";
import AudioRecorder from "@/components/media/AudioRecorder";
import FilePreview from "@/components/media/FilePreview";
import GifPicker from "@/components/media/GifPicker";
import StickerPicker from "@/components/media/StickerPicker";
import { uploadSingleFile } from "@/services/uploadService";
import type { Attachment, ChatMessage } from "@/types/message";

interface SendPayload {
  text: string;
  attachments?: Attachment[];
  messageType?: ChatMessage["messageType"];
}

interface MessageInputProps {
  onSend: (payload: SendPayload) => Promise<void> | void;
  disabled?: boolean;
  isSending?: boolean;
}

type PanelMode = "none" | "attachments" | "picker" | "audio";
type PickerTab = "emoji" | "gif" | "sticker";
type UploadableAttachmentType = Extract<
  AttachmentType,
  "image" | "video" | "document" | "audio"
>;
type UploadPickerMode = UploadableAttachmentType | "media" | "camera";

const emojiSeedOptions = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "🤣",
  "😂",
  "🙂",
  "😉",
  "😊",
  "😇",
  "🥰",
  "😍",
  "🤩",
  "😘",
  "😎",
  "🤓",
  "🫡",
  "🥳",
  "🤗",
  "🤔",
  "😴",
  "😌",
  "😮",
  "😢",
  "😭",
  "😡",
  "🤯",
  "😱",
  "🥶",
  "🥵",
  "😅",
  "🙌",
  "👏",
  "👍",
  "👎",
  "👌",
  "✌️",
  "🤝",
  "🙏",
  "💪",
  "🫶",
  "👀",
  "❤️",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "💔",
  "❣️",
  "💕",
  "💞",
  "💯",
  "🔥",
  "✨",
  "⭐",
  "🌟",
  "🎉",
  "🎊",
  "🥂",
  "🍾",
  "🎂",
  "🍕",
  "🍔",
  "☕",
  "🍿",
  "⚽",
  "🏏",
  "🏀",
  "🎮",
  "🎵",
  "🎧",
  "🚀",
  "🎯",
  "🏆",
  "🌍",
  "🌈",
  "🌙",
  "☀️",
  "⛈️",
  "🌸",
  "🌹",
  "🌻",
  "🌴",
  "🐶",
  "🐱",
  "🦊",
  "🐼",
  "🐵",
  "🦄",
  "🐧",
  "🐢",
  "🍀",
  "🎈",
  "🧠",
  "📚",
  "💡",
  "✅",
];

const buildExpandedEmojiOptions = (seed: string[]) => {
  const ranges: Array<[number, number]> = [
    [0x1f300, 0x1f5ff],
    [0x1f600, 0x1f64f],
    [0x1f680, 0x1f6ff],
    [0x1f900, 0x1f9ff],
    [0x1fa70, 0x1faff],
    [0x2600, 0x26ff],
    [0x2700, 0x27bf],
  ];

  const expanded = [...seed];

  for (const [start, end] of ranges) {
    for (let code = start; code <= end; code += 1) {
      const symbol = String.fromCodePoint(code);
      if (!/\p{Extended_Pictographic}/u.test(symbol)) continue;
      expanded.push(symbol);
    }
  }

  return Array.from(new Set(expanded));
};

type EmojiBucket =
  | "smileys"
  | "people"
  | "animals"
  | "food"
  | "activities"
  | "travel"
  | "objects"
  | "symbols"
  | "flags";

const emojiCategoryMeta: Record<EmojiBucket, string> = {
  smileys: "Smileys",
  people: "People",
  animals: "Animals",
  food: "Food",
  activities: "Activities",
  travel: "Travel",
  objects: "Objects",
  symbols: "Symbols",
  flags: "Flags",
};

type EmojiCategoryKey = "all" | EmojiBucket;

const emojiTabs: Array<{ key: EmojiCategoryKey; label: string; icon: string }> = [
  { key: "all", label: "Recent", icon: "🕘" },
  { key: "smileys", label: emojiCategoryMeta.smileys, icon: "🙂" },
  { key: "people", label: emojiCategoryMeta.people, icon: "👋" },
  { key: "animals", label: emojiCategoryMeta.animals, icon: "🐻" },
  { key: "food", label: emojiCategoryMeta.food, icon: "🍔" },
  { key: "activities", label: emojiCategoryMeta.activities, icon: "⚽" },
  { key: "travel", label: emojiCategoryMeta.travel, icon: "🚗" },
  { key: "objects", label: emojiCategoryMeta.objects, icon: "💡" },
  { key: "symbols", label: emojiCategoryMeta.symbols, icon: "🔣" },
  { key: "flags", label: emojiCategoryMeta.flags, icon: "🏳️" },
];

const isInRange = (value: number, start: number, end: number) =>
  value >= start && value <= end;

const isInRanges = (value: number, ranges: Array<[number, number]>) =>
  ranges.some(([start, end]) => isInRange(value, start, end));

const regionalIndicatorStart = 0x1f1e6;
const skinToneModifiers = ["🏻", "🏼", "🏽", "🏾", "🏿"];
const skinToneBases = [
  "👋",
  "🤚",
  "🖐️",
  "✋",
  "🖖",
  "👌",
  "🤌",
  "🤏",
  "✌️",
  "🤞",
  "🫰",
  "🤟",
  "🤘",
  "🤙",
  "👈",
  "👉",
  "👆",
  "👇",
  "☝️",
  "👍",
  "👎",
  "✊",
  "👊",
  "🤛",
  "🤜",
  "👏",
  "🙌",
  "👐",
  "🤲",
  "🙏",
  "💪",
  "🫶",
];

const specialFlagEmojis = ["🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "🏳️‍⚧️"];

const fallbackRegionCodes = [
  "IN",
  "US",
  "GB",
  "CA",
  "AU",
  "NZ",
  "DE",
  "FR",
  "IT",
  "ES",
  "JP",
  "KR",
  "BR",
  "AE",
  "SG",
  "ZA",
  "MX",
  "SA",
  "ID",
  "PK",
  "BD",
  "LK",
  "NP",
  "MY",
  "TH",
  "VN",
  "PH",
  "CN",
  "RU",
];

const toFlagEmoji = (countryCode: string) => {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return Array.from(code)
    .map((char) => String.fromCodePoint(regionalIndicatorStart + char.charCodeAt(0) - 65))
    .join("");
};

const getRegionCodes = () => {
  const intlObject = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  };

  if (typeof intlObject.supportedValuesOf === "function") {
    try {
      const regions = intlObject.supportedValuesOf("region");
      const twoLetterRegions = regions.filter((item) => /^[A-Z]{2}$/.test(item));
      if (twoLetterRegions.length > 0) return twoLetterRegions;
    } catch {
      // Ignore and use fallback list.
    }
  }

  return fallbackRegionCodes;
};

const buildFlagEmojiOptions = () =>
  Array.from(
    new Set([
      ...specialFlagEmojis,
      ...getRegionCodes().map(toFlagEmoji).filter(Boolean),
    ]),
  );

const buildSkinToneVariants = () =>
  Array.from(
    new Set(
      skinToneBases.flatMap((emoji) =>
        skinToneModifiers.map((modifier) => `${emoji}${modifier}`),
      ),
    ),
  );

const flagEmojiOptions = buildFlagEmojiOptions();
const skinToneEmojiOptions = buildSkinToneVariants();

const enrichedEmojiSeed = Array.from(
  new Set([...emojiSeedOptions, ...skinToneEmojiOptions]),
);

const allEmojiOptions = Array.from(
  new Set([...buildExpandedEmojiOptions(enrichedEmojiSeed), ...flagEmojiOptions]),
);

const isFlagEmoji = (emoji: string) => {
  if (specialFlagEmojis.includes(emoji)) return true;
  const units = Array.from(emoji);
  if (units.length !== 2) return false;
  return units.every((unit) => {
    const codePoint = unit.codePointAt(0) || 0;
    return isInRange(codePoint, 0x1f1e6, 0x1f1ff);
  });
};

const classifyEmojiBucket = (emoji: string): EmojiBucket => {
  if (isFlagEmoji(emoji)) return "flags";

  const codePoint = emoji.codePointAt(0) || 0;

  if (
    isInRanges(codePoint, [
      [0x1f600, 0x1f64f],
      [0x1f910, 0x1f93a],
      [0x1f970, 0x1f97f],
      [0x1fae0, 0x1faef],
    ])
  ) {
    return "smileys";
  }

  if (
    isInRanges(codePoint, [
      [0x1f440, 0x1f64f],
      [0x1f466, 0x1f487],
      [0x1f574, 0x1f57a],
      [0x1f590, 0x1f596],
      [0x1f6b4, 0x1f6c5],
      [0x1f90c, 0x1f93a],
      [0x1f9b0, 0x1f9e6],
      [0x1fac0, 0x1facf],
      [0x1faf0, 0x1faff],
    ])
  ) {
    return "people";
  }

  if (
    isInRanges(codePoint, [
      [0x1f400, 0x1f43f],
      [0x1f980, 0x1f9ae],
      [0x1f577, 0x1f578],
      [0x1f40d, 0x1f40f],
    ])
  ) {
    return "animals";
  }

  if (
    isInRanges(codePoint, [
      [0x1f32d, 0x1f37f],
      [0x1f950, 0x1f96f],
      [0x1f9c0, 0x1f9cf],
    ])
  ) {
    return "food";
  }

  if (
    isInRanges(codePoint, [
      [0x1f383, 0x1f3ca],
      [0x1f3cf, 0x1f3f0],
      [0x1f947, 0x1f9c0],
      [0x1f93a, 0x1f94f],
    ])
  ) {
    return "activities";
  }

  if (
    isInRanges(codePoint, [
      [0x1f680, 0x1f6ff],
      [0x1f5fa, 0x1f5ff],
      [0x1f300, 0x1f320],
      [0x1f30d, 0x1f30f],
    ])
  ) {
    return "travel";
  }

  if (
    isInRanges(codePoint, [
      [0x1f4a0, 0x1f4ff],
      [0x1f50a, 0x1f579],
      [0x1f5a4, 0x1f5ff],
      [0x1f9f0, 0x1f9ff],
      [0x1fa70, 0x1faff],
    ])
  ) {
    return "objects";
  }

  return "symbols";
};

const emojiCategoryOptions: Record<
  EmojiBucket,
  { label: string; emojis: string[] }
> = {
  smileys: { label: emojiCategoryMeta.smileys, emojis: [] },
  people: { label: emojiCategoryMeta.people, emojis: [] },
  animals: { label: emojiCategoryMeta.animals, emojis: [] },
  food: { label: emojiCategoryMeta.food, emojis: [] },
  activities: { label: emojiCategoryMeta.activities, emojis: [] },
  travel: { label: emojiCategoryMeta.travel, emojis: [] },
  objects: { label: emojiCategoryMeta.objects, emojis: [] },
  symbols: { label: emojiCategoryMeta.symbols, emojis: [] },
  flags: { label: emojiCategoryMeta.flags, emojis: [] },
};

for (const emoji of allEmojiOptions) {
  const bucket = classifyEmojiBucket(emoji);
  emojiCategoryOptions[bucket].emojis.push(emoji);
}

for (const key of Object.keys(emojiCategoryOptions) as EmojiBucket[]) {
  emojiCategoryOptions[key].emojis = Array.from(
    new Set(emojiCategoryOptions[key].emojis),
  );
}

const getEmojiCategoryItems = (category: EmojiCategoryKey) => {
  if (category === "all") return allEmojiOptions;
  return emojiCategoryOptions[category].emojis;
};

const emojiCategoryKeywords: Record<EmojiCategoryKey, string[]> = {
  all: [
    "all",
    "emoji",
    "reaction",
    "smile",
    "people",
    "animal",
    "food",
    "travel",
    "symbol",
    "flag",
  ],
  smileys: ["smile", "happy", "sad", "laugh", "face", "emotion"],
  people: ["hand", "person", "gesture", "body", "friend", "wave"],
  animals: ["animal", "pet", "nature", "bird", "fish", "wild"],
  food: ["food", "drink", "fruit", "meal", "snack", "coffee"],
  activities: ["sport", "game", "music", "activity", "fun", "party"],
  travel: ["travel", "car", "place", "trip", "map", "weather"],
  objects: ["object", "tool", "device", "book", "tech", "item"],
  symbols: ["heart", "symbol", "mark", "warning", "love", "status"],
  flags: ["flag", "country", "nation", "region"],
};

const fileAcceptByType: Record<UploadableAttachmentType, string> = {
  image: "image/*",
  video: "video/*",
  document:
    ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.odt,.rtf",
  audio: "audio/*",
};

const allowedFileTypes: Attachment["fileType"][] = [
  "image",
  "video",
  "document",
  "audio",
  "gif",
  "sticker",
];

const isUploadableType = (value: AttachmentType): value is UploadableAttachmentType =>
  value === "image" ||
  value === "video" ||
  value === "document" ||
  value === "audio";

const resolveMessageType = (
  text: string,
  attachments: Attachment[],
): ChatMessage["messageType"] => {
  if (!attachments.length) return "text";
  if (text) return "mixed";
  if (attachments.length > 1) return "mixed";
  return attachments[0]?.fileType || "mixed";
};

const resolveAttachmentType = (
  value: string,
  fallback: Attachment["fileType"],
): Attachment["fileType"] => {
  const normalized = String(value).trim().toLowerCase() as Attachment["fileType"];
  if (allowedFileTypes.includes(normalized)) return normalized;
  return fallback;
};

export default function MessageInput({
  onSend,
  disabled = false,
  isSending = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [activePanel, setActivePanel] = useState<PanelMode>("none");
  const [pickerTab, setPickerTab] = useState<PickerTab>("emoji");
  const [draftAttachments, setDraftAttachments] = useState<Attachment[]>([]);
  const [uploadPickerMode, setUploadPickerMode] = useState<UploadPickerMode | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeEmojiCategory, setActiveEmojiCategory] =
    useState<EmojiCategoryKey>("all");
  const [visibleEmojiCount, setVisibleEmojiCount] = useState(160);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentPanelRef = useRef<HTMLDivElement | null>(null);
  const pickerPanelRef = useRef<HTMLDivElement | null>(null);
  const audioPanelRef = useRef<HTMLDivElement | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const micButtonRef = useRef<HTMLButtonElement | null>(null);
  const activeEmojiOptions = getEmojiCategoryItems(activeEmojiCategory);
  const normalizedEmojiSearch = emojiSearch.trim().toLowerCase();
  const filteredEmojiOptions = normalizedEmojiSearch
    ? activeEmojiOptions.filter((emoji) => {
        if (emoji.includes(normalizedEmojiSearch)) return true;
        return emojiCategoryKeywords[activeEmojiCategory].some((keyword) =>
          keyword.includes(normalizedEmojiSearch),
        );
      })
    : activeEmojiOptions;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("stickhere_recent_emojis");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed
        .filter((item) => typeof item === "string")
        .slice(0, 24);
      setRecentEmojis(cleaned);
    } catch {
      // Ignore storage parsing errors.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "stickhere_recent_emojis",
      JSON.stringify(recentEmojis.slice(0, 24)),
    );
  }, [recentEmojis]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        activePanel === "attachments" &&
        !attachmentPanelRef.current?.contains(target) &&
        !addButtonRef.current?.contains(target)
      ) {
        setActivePanel("none");
        return;
      }

      if (
        activePanel === "picker" &&
        !pickerPanelRef.current?.contains(target) &&
        !emojiButtonRef.current?.contains(target)
      ) {
        setActivePanel("none");
        return;
      }

      if (
        activePanel === "audio" &&
        !audioPanelRef.current?.contains(target) &&
        !micButtonRef.current?.contains(target)
      ) {
        setActivePanel("none");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [activePanel]);

  const openPickerPanel = (tab: PickerTab) => {
    setPickerTab(tab);
    setActiveEmojiCategory("all");
    setVisibleEmojiCount(160);
    setEmojiSearch("");
    setUploadError(null);
    setActivePanel("picker");
  };

  const togglePanel = (panel: Exclude<PanelMode, "none">) => {
    setUploadError(null);

    if (panel === "attachments") {
      setActivePanel((current) => (current === "attachments" ? "none" : "attachments"));
      return;
    }

    if (panel === "picker") {
      if (activePanel === "picker" && pickerTab === "emoji") {
        setActivePanel("none");
        return;
      }
      openPickerPanel("emoji");
      return;
    }

    if (panel === "audio") {
      setActivePanel((current) => (current === "audio" ? "none" : "audio"));
      return;
    }
  };

  const openFilePicker = (mode: UploadPickerMode, accept: string) => {
    setUploadPickerMode(mode);
    setUploadError(null);
    setActivePanel("none");

    const picker = fileInputRef.current;
    if (!picker) return;
    picker.value = "";
    picker.accept = accept;
    if (mode === "camera") {
      picker.setAttribute("capture", "environment");
    } else {
      picker.removeAttribute("capture");
    }
    picker.click();
  };

  const handleAttachmentType = (type: AttachmentType) => {
    if (controlsLocked) return;

    if (type === "gif") {
      openPickerPanel("gif");
      return;
    }

    if (type === "sticker") {
      openPickerPanel("sticker");
      return;
    }

    if (type === "audio") {
      setActivePanel("audio");
      return;
    }

    if (type === "media") {
      openFilePicker("media", "image/*,video/*");
      return;
    }

    if (type === "camera") {
      openFilePicker("camera", "image/*,video/*");
      return;
    }

    if (type === "document") {
      openFilePicker("document", fileAcceptByType.document);
      return;
    }

    if (type === "image") {
      openFilePicker("image", fileAcceptByType.image);
      return;
    }

    if (type === "video") {
      openFilePicker("video", fileAcceptByType.video);
      return;
    }

    if (!isUploadableType(type)) return;
  };

  const handleFilePicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadPickerMode) return;

    const isAutoMode =
      uploadPickerMode === "media" || uploadPickerMode === "camera";
    const resolvedType: UploadableAttachmentType = isAutoMode
      ? file.type.startsWith("video/")
        ? "video"
        : "image"
      : uploadPickerMode;

    await uploadAttachmentFile(file, resolvedType, isAutoMode);
    event.target.value = "";
  };

  const uploadAttachmentFile = async (
    file: File,
    type: UploadableAttachmentType,
    inferTypeFromMime = false,
  ) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      const uploaded = await uploadSingleFile(file, inferTypeFromMime ? "" : type);
      const fileTypeFallback: Attachment["fileType"] = type;
      const attachment: Attachment = {
        url: uploaded.url,
        fileType: resolveAttachmentType(uploaded.fileType, fileTypeFallback),
        filename: uploaded.filename || file.name,
        mimeType: uploaded.mimeType || file.type,
        size: uploaded.size || file.size,
        durationSeconds: uploaded.durationSeconds || 0,
      };

      setDraftAttachments((current) => [...current, attachment]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload file");
    } finally {
      setIsUploading(false);
      setUploadPickerMode(null);
    }
  };

  const openAudioFilePicker = () => {
    if (controlsLocked) return;
    setUploadPickerMode("audio");
    setUploadError(null);
    setActivePanel("none");

    const picker = fileInputRef.current;
    if (!picker) return;
    picker.value = "";
    picker.accept = fileAcceptByType.audio;
    picker.click();
  };

  const addEmoji = (emoji: string) => {
    setText((current) => `${current}${emoji}`);
    setRecentEmojis((current) => {
      const next = [emoji, ...current.filter((item) => item !== emoji)];
      return next.slice(0, 24);
    });
  };

  const addRemoteAttachment = (
    fileType: Extract<Attachment["fileType"], "gif" | "sticker">,
    url: string,
  ) => {
    setDraftAttachments((current) => [
      ...current,
      {
        url,
        fileType,
        filename: fileType.toUpperCase(),
      },
    ]);
    setActivePanel("none");
  };

  const removeDraftAttachment = (index: number) => {
    setDraftAttachments((current) => current.filter((_, i) => i !== index));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && draftAttachments.length === 0) return;
    if (disabled) {
      setUploadError("Open a chat first to send messages.");
      return;
    }

    await onSend({
      text: trimmed,
      attachments: draftAttachments,
      messageType: resolveMessageType(trimmed, draftAttachments),
    });

    setText("");
    setDraftAttachments([]);
    setActivePanel("none");
    setUploadError(null);
  };

  const cannotSend =
    disabled ||
    isSending ||
    isUploading ||
    (!text.trim() && draftAttachments.length === 0);
  const controlsLocked = isSending || isUploading;
  const showMicAction = !text.trim() && draftAttachments.length === 0;
  const currentEmojiCategoryTitle =
    activeEmojiCategory === "all"
      ? "All"
      : emojiCategoryMeta[activeEmojiCategory];
  const visibleEmojiOptions = filteredEmojiOptions.slice(0, visibleEmojiCount);
  const recentForDisplay = recentEmojis.length
    ? recentEmojis
    : emojiSeedOptions.slice(0, 8);

  return (
    <div className="relative border-t border-[#1F2D34] bg-[#111B21] p-3">
      {uploadError ? (
        <p className="mb-2 rounded border border-[#9F4A4A]/70 bg-[#5C2B2B]/50 px-2 py-1 text-xs text-[#FFD4D4]">
          {uploadError}
        </p>
      ) : null}

      {draftAttachments.length > 0 ? (
        <div className="mb-2 grid gap-2 sm:grid-cols-2">
          {draftAttachments.map((attachment, index) => (
            <FilePreview
              key={`${attachment.url}-${index}`}
              file={attachment}
              onRemove={() => removeDraftAttachment(index)}
            />
          ))}
        </div>
      ) : null}

      {activePanel === "attachments" ? (
        <div
          ref={attachmentPanelRef}
          className="absolute bottom-[calc(100%+10px)] left-3 z-40"
        >
          <AttachmentMenu
            onSelect={handleAttachmentType}
            disabled={controlsLocked}
          />
        </div>
      ) : null}

      {activePanel === "picker" ? (
        <div
          ref={pickerPanelRef}
          className="absolute bottom-[calc(100%+10px)] left-3 z-40 w-[min(40rem,calc(100vw-1.5rem))] rounded-2xl border border-[#28313A] bg-[#171B20] p-3 shadow-2xl shadow-black/50"
        >
          {pickerTab === "emoji" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {emojiTabs.map((tab) => {
                  const isActive = tab.key === activeEmojiCategory;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setActiveEmojiCategory(tab.key);
                        setVisibleEmojiCount(160);
                      }}
                      disabled={controlsLocked}
                      title={tab.label}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base ${
                        isActive
                          ? "border-[#00D26A] text-[#E9EEF2]"
                          : "border-[#37404A] text-[#AAB4BE] hover:text-[#E9EEF2]"
                      } disabled:cursor-not-allowed disabled:opacity-55`}
                    >
                      {tab.icon}
                    </button>
                  );
                })}
              </div>

              <div className="flex h-12 items-center gap-2 rounded-full border border-[#00D26A] bg-[#1C2128] px-4">
                <span className="text-[#AAB4BE]">🔎</span>
                <input
                  value={emojiSearch}
                  onChange={(event) => {
                    setEmojiSearch(event.target.value);
                    setVisibleEmojiCount(160);
                  }}
                  placeholder="Search emoji"
                  disabled={controlsLocked}
                  className="h-full w-full bg-transparent text-sm text-[#E9EEF2] placeholder:text-[#8E98A3] outline-none"
                />
              </div>

              {!normalizedEmojiSearch ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#AAB4BE]">Recent</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {recentForDisplay.map((emoji, index) => (
                      <button
                        key={`recent-${emoji}-${index}`}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        disabled={controlsLocked}
                        className="h-10 w-10 rounded-full text-2xl transition hover:bg-[#242A32] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="text-sm font-semibold text-[#AAB4BE]">
                {currentEmojiCategoryTitle}
              </p>
              <div className="grid max-h-72 grid-cols-10 gap-1 overflow-y-auto pr-1">
                {visibleEmojiOptions.map((emoji, index) => (
                  <button
                    key={`${activeEmojiCategory}-${emoji}-${index}`}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-2xl transition hover:bg-[#242A32]"
                    onClick={() => addEmoji(emoji)}
                    disabled={controlsLocked}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {!visibleEmojiOptions.length ? (
                <p className="text-xs text-[#AAB4BE]">No emoji match this search.</p>
              ) : null}

              {visibleEmojiCount < filteredEmojiOptions.length ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleEmojiCount((current) =>
                      Math.min(current + 160, filteredEmojiOptions.length),
                    )
                  }
                  disabled={controlsLocked}
                  className="w-full rounded-full border border-[#37404A] bg-[#1C2128] px-3 py-2 text-xs font-semibold text-[#D8DEE5] hover:bg-[#242A32] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Load more emojis
                </button>
              ) : null}
            </div>
          ) : null}

          {pickerTab === "gif" ? <GifPicker onSelect={(url) => addRemoteAttachment("gif", url)} /> : null}

          {pickerTab === "sticker" ? (
            <StickerPicker onSelect={(url) => addRemoteAttachment("sticker", url)} />
          ) : null}

          <div className="mt-3 grid grid-cols-3 gap-2 rounded-full border border-[#2A313A] bg-[#14181D] p-1">
            <button
              type="button"
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                pickerTab === "emoji"
                  ? "bg-[#242A32] text-[#E9EEF2]"
                  : "text-[#AAB4BE] hover:text-[#E9EEF2]"
              }`}
              onClick={() => setPickerTab("emoji")}
            >
              Emoji
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                pickerTab === "gif"
                  ? "bg-[#242A32] text-[#E9EEF2]"
                  : "text-[#AAB4BE] hover:text-[#E9EEF2]"
              }`}
              onClick={() => setPickerTab("gif")}
            >
              GIF
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                pickerTab === "sticker"
                  ? "bg-[#242A32] text-[#E9EEF2]"
                  : "text-[#AAB4BE] hover:text-[#E9EEF2]"
              }`}
              onClick={() => setPickerTab("sticker")}
            >
              Sticker
            </button>
          </div>
        </div>
      ) : null}

      {activePanel === "audio" ? (
        <div
          ref={audioPanelRef}
          className="absolute bottom-[calc(100%+10px)] left-3 z-40 w-72 space-y-2 rounded-2xl border border-[#2A313A] bg-[#171B20] p-3 shadow-2xl shadow-black/50"
        >
          <AudioRecorder
            disabled={controlsLocked}
            onRecorded={(file) => {
              void uploadAttachmentFile(file, "audio");
            }}
          />
          <button
            type="button"
            onClick={openAudioFilePicker}
            disabled={controlsLocked}
            className="w-full rounded border border-[#408A71]/70 bg-[#285A48] px-3 py-2 text-xs font-semibold text-[#B0E4CC] hover:bg-[#408A71] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Choose Audio File
          </button>
        </div>
      ) : null}

      {isUploading ? (
        <p className="mb-2 text-xs text-[#AAB4BE]">Uploading attachment...</p>
      ) : null}

      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-full border border-[#2A313A] bg-[#1C2128] px-2 py-1"
      >
        <button
          ref={addButtonRef}
          type="button"
          onClick={() => togglePanel("attachments")}
          disabled={controlsLocked}
          className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[#AAB4BE] hover:bg-[#242A32] hover:text-[#E9EEF2] disabled:cursor-not-allowed disabled:opacity-55"
        >
          +
        </button>
        <button
          ref={emojiButtonRef}
          type="button"
          onClick={() => togglePanel("picker")}
          disabled={controlsLocked}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#AAB4BE] hover:bg-[#242A32] hover:text-[#E9EEF2] disabled:cursor-not-allowed disabled:opacity-55"
        >
          🙂 
        </button>
        <input
          className="h-10 flex-1 bg-transparent px-1 text-sm text-[#E9EEF2] placeholder:text-[#8E98A3] outline-none"
          placeholder="Type a message..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={controlsLocked}
        />

        {showMicAction ? (
          <button
            ref={micButtonRef}
            type="button"
            onClick={() => togglePanel("audio")}
            disabled={controlsLocked}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#AAB4BE] hover:bg-[#242A32] hover:text-[#E9EEF2] disabled:cursor-not-allowed disabled:opacity-55"
            title="Record audio"
          >
            🎙️
          </button>
        ) : (
          <Button
            type="submit"
            isLoading={isSending}
            disabled={cannotSend}
            className="h-10 rounded-full px-5"
          >
            Send
          </Button>
        )}
      </form>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          void handleFilePicked(event);
        }}
      />
    </div>
  );
}

