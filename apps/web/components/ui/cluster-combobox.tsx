"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BitcoinCluster,
  ClusterObject,
  EthCluster,
  Network,
  SolCluster,
  USDCCluster,
  enumToClustersArray,
} from "@paybox/common";

export function ClusterCombo({
  network,
  selectCluster,
}: {
  network: Network;
  selectCluster: (
    cluster: EthCluster | SolCluster | BitcoinCluster | USDCCluster
  ) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [clustersArray, setClusters] = React.useState<ClusterObject[]>(
    enumToClustersArray(SolCluster)
  );

  React.useEffect(() => {
    switch (network) {
      case Network.Sol:
        setClusters(enumToClustersArray(SolCluster));
        break;
      case Network.Eth:
        setClusters(enumToClustersArray(EthCluster));
        break;
      case Network.Bitcoin:
        setClusters(enumToClustersArray(BitcoinCluster));
        break;
      case Network.USDC:
        setClusters(enumToClustersArray(USDCCluster));
        break;
      default:
        setClusters([]);
        break;
    }
  }, [network]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? clustersArray?.find(
                (clusterObject) => clusterObject.value === value
              )?.label
            : "Select Cluster..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandEmpty>No Cluster found.</CommandEmpty>
          <CommandGroup>
            {clustersArray?.map((clusterObject) => (
              <CommandItem
                key={clusterObject.value}
                value={clusterObject.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                  selectCluster(
                    currentValue as
                      | EthCluster
                      | SolCluster
                      | BitcoinCluster
                      | USDCCluster
                  );
                }}
              >
                {clusterObject.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === clusterObject.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
