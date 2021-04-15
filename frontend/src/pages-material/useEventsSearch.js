import { useEffect, useState } from "react";
import axios from "axios";
import { buildPath } from "../config";

export default function useEventsSearch(query, limit, offset) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [events, setEvents] = useState([]);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        if (offset === 0) {
            setEvents([]);
        }
    }, [query, offset]);

    useEffect(() => {
        setLoading(true);
        setError(false);

        let cancel;
        axios
            .get(buildPath("api/events/"), {
                withCredentials: true,
                params: { search: query, limit: limit, offset: offset },
                cancelToken: new axios.CancelToken((c) => (cancel = c)),
            })
            .then((res) => {
                setEvents((prevEvents) => {
                    return [...prevEvents, ...res.data];
                });

                setHasMore(res.data.length > 0);
                setLoading(false);
            })
            .catch((e) => {
                if (axios.isCancel(e)) return;

                console.log(e);
                setError(true);
            });

        return () => cancel();
    }, [query, limit, offset]);

    return { loading, error, events, hasMore };
}
