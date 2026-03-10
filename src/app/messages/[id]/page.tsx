import MessagesApp from "./MessagesApp";

import { use } from "react";

export default function Page(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    return <MessagesApp appId={params.id} />;
}
