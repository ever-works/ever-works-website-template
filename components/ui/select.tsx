"use client";

import * as React from "react";

const Select = ({ children }: { children?: React.ReactNode }) => {
  return <>{children}</>;
};
Select.displayName = "Select";
const SelectItem = ({
  children,
  value,
}: {
  children?: React.ReactNode;
  value?: string;
}) => {
  return <option value={value}>{children}</option>;
};
SelectItem.displayName = "SelectItem";

const SelectGroup = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
SelectGroup.displayName = "SelectGroup";

const SelectValue = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
SelectValue.displayName = "SelectValue";

const SelectTrigger = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
SelectContent.displayName = "SelectContent";

const SelectLabel = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = () => null;
SelectSeparator.displayName = "SelectSeparator";

const SelectScrollUpButton = () => null;
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = () => null;
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
