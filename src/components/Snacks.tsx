import React from "react";
import { StringParam, useQueryParams, withDefault } from "use-query-params";
import snacktypes from "./snacktypes";

export default function Snacks() {

    const [{ snack }] = useQueryParams({ snack: withDefault(StringParam, 'home') })
    const Component = snacktypes[snack]

    return <Component />
}