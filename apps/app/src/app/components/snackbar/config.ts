export type TSASnackbarActionFn = () => Promise<void> | void;

export type TSASnackbarAction = {
  /**
   * Register an action handler that is called everytime the snackbar
   * is clicked or the action button was triggered
   */
  actionFn: TSASnackbarActionFn;
  /**
   * Text that appears on the action button
   */
  text: string;
};

export type TSASnackbarConfig = {
  /**
   * Duration after which a snackbar is automatically dismissed.
   * The value must be passed in milliseconds.
   * @default 5000
   */
  duration: number;
  /**
   * Register an action handler that is called everytime the snackbar
   * is clicked or the action button was triggered
   */
  action?: TSASnackbarAction;

  /**
   * The message to show in the snackbar
   */
  message: string;
};

/**
 * Options to configure
 * a snackbar's behaviour
 */
export type TSASnackbarOptions = Partial<Omit<TSASnackbarConfig, "data">>;

export const TSA_SNACKBAR_DEFAULT_CONFIG: TSASnackbarConfig = {
  duration: 5000,
  message: ""
};
