import React from "react";
import { NumberParam, StringParam, useQueryParams } from "use-query-params";
import { Helmet } from "react-helmet";

const map = {
    code: NumberParam,
    description: StringParam,
    url: StringParam,
}

function Error() {

    const [{ code, description, url }] = useQueryParams(map)

    return <div className="h-full">
        <Helmet>
            <title>Error</title>
        </Helmet>
        <div>
            {code}
        </div>
        <div>
            {description}
        </div>
        <div>
            {url}
        </div>

    </div>
}

export default Error