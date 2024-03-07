"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { labels, statuses } from "../data/data";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "@radix-ui/react-icons";
import { SOLSCAN_ACCOUNT_URL, SOLSCAN_TXN_URL, TxnType, getAccountUrl, getTransactionUrl } from "@paybox/common";
import Link from "next/link";
import { get } from "http";

export const columns: ColumnDef<TxnType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Txn Id" />
    ),

    cell: ({ row }) => (
      // make the cluster dynamic
      <Link
        target="_blank"
        href={getTransactionUrl(row.original.network, row.original.hash, row.original.cluster)}
      >
        <div className="w-[80px]">
          Txn-{(row.getValue("id") as string).split("-")[1]}
        </div>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "from",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender" />
    ),
    cell: ({ row }) => {
      const label = labels.find(
        (label) => label.value === row.original.network,
      );
      // Give the label as Network type and fill the sender address or his name
      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <Link
            target="_blank"
            href={getAccountUrl(row.original.network, row.original.from, row.original.cluster)}
          >
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("from")}
            </span>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));

      return (
        <div className="font-medium">
          {amount} {row.original.network}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "fee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fees" />
    ),
    cell: ({ row }) => {
      const network = row.original.network;
      const type = network == "sol" ? "lamps" : "gwei";
      const amount = parseFloat(row.getValue("fee"));

      return (
        <div className="font-medium">
          {amount} {type}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      // for now all are confirmed
      const status = statuses.find((status) => status.value === "done");

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Block Date" />
    ),
    cell: ({ row }) => {
      const blockDate = new Date(row.original.time);
      const formattedDate = format(blockDate, "do MMM yy");
      return (
        <div className="flex items-center space-x-2">
          <CalendarIcon />
          <span>{formattedDate}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "blockTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Block Time" />
    ),
    cell: ({ row }) => {
      const blockTimeMilliseconds = row.original.time * 1000;

      const blockDate = new Date(blockTimeMilliseconds);
      const formattedTime = format(blockDate, "h:mm a");
      return (
        <div className="flex items-center space-x-2">
          <ClockIcon />
          <span>{formattedTime}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
