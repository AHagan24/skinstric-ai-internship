import { DiamondAction } from "@/components/diamond-action";

type BackActionProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export function BackAction({ onClick, disabled = false }: BackActionProps) {
  return (
    <DiamondAction
      direction="left"
      label="BACK"
      href={onClick ? undefined : "/"}
      onClick={onClick}
      disabled={disabled}
      variant="bottom"
    />
  );
}
