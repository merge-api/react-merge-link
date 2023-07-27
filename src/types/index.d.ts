export type AdditionalSuccessfulLinkInfo = {
  isTokenForOtherPreexistingLinkedAccount?: boolean;
};

export type ValidationErrors = ValidationError[];

export type ValidationError = {
  detail: string;
  problem_type?: string;
  [key: string]: any;
};

export interface MergeLink {
  initialize: (config: InitializeProps) => void;
  update: (config: {
    linkToken: string;
    onValidationError?: (errors: ValidationErrors) => void;
    onSuccess: (
      publicToken: string,
      additionalInfo?: AdditionalSuccessfulLinkInfo
    ) => void;
  }) => void;
  openLink: (config: UseMergeLinkProps) => void;
}

export type MergeFileStorageData = {
  type?: FilePickerObjectType;
  id: string;
  name?: string;
  description?: string;
  // url to access the file/folder
  url?: string;
  // updated_at is a datetime string
  updatedAt?: string;
  // size in bytes
  size?: number;
  // for files they can have a mime type (essentially file_type)
  mime_type?: string;
};

export enum FilePickerObjectType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  DRIVE = 'DRIVE',
}

export type FilePickerConfig = {
  onSubmit: (returnVal: Array<MergeFileStorageData>) => void;
  types?: FilePickerObjectType[];
  allowMultiSelect?: boolean;
};

export interface TenantConfig {
  apiBaseURL?: string;
}
export interface UseMergeLinkProps {
  linkToken?: string | undefined;
  tenantConfig?: TenantConfig;
  onValidationError?: (errors: ValidationErrors) => void;
  onSuccess: (
    publicToken: string,
    additionalInfo?: AdditionalSuccessfulLinkInfo
  ) => void;
  onExit?: () => void;
  /**
   * Make Link call `onSuccess` immediately after an account has been successfully linked instead of after the user closes the Link modal.
   * Defaults to `true` as of v2.0.0. The default is `false` in prior versions.
   */
  shouldSendTokenOnSuccessfulLink?: boolean | undefined;
  /**
   * Passing this optional input into useMergeLink will allow users to use the File Picker
   */
  filePickerConfig?: FilePickerConfig;
}

export interface InitializeProps extends UseMergeLinkProps {
  linkToken: string;
  onReady?: () => void;
}

export type UseMergeLinkResponse = {
  open: () => void;
  isReady: boolean;
  error: ErrorEvent | null;
};

declare global {
  interface Window {
    MergeLink: MergeLink;
  }
}
