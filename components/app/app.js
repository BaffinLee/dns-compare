import { h } from 'https://esm.sh/preact@10.18.1';
import { useState, useCallback, useEffect } from 'https://esm.sh/preact@10.18.1/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import { Input } from '../input/input.js';
import { Result } from '../result/result.js';
import { Type } from '../type/type.js';
import { dnsQuery } from '../../utils/api.js';
import { Loading } from '../loading/loading.js';
import { getUrlQuery, setUrlQuery } from '../../utils/url.js';

const html = htm.bind(h);

export function App () {
    const [name, setName] = useState('');
    const [type, setType] = useState('A');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [queryed, setQueryed] = useState(false);

    const queryDns = useCallback((newType, newName) => {
        if (loading) return;
        setLoading(true);
        setGroups([]);
        dnsQuery(newName || name, newType || type).then(res => {
            setLoading(false);
            setGroups(res);
            setQueryed(true);
        }).catch(err => {
            setLoading(false);
            setGroups([]);
            setQueryed(true);
            console.error(err);
        });
        setUrlQuery('domain', newName || name);
    }, [name, type, loading, setGroups, setLoading, setQueryed]);

    const handleNameChange = useCallback((newName) => {
        setName(newName);
    }, [setName]);

    const handleTypeChange = useCallback((newType) => {
        setType(newType);
        queryDns(newType);
    }, [setType, queryDns]);

    useEffect(() => {
        const domain = getUrlQuery('domain');
        if (domain) {
            queryDns(type, domain);
            setName(domain);
        }
    }, []);

    return html`
        <div class="container">
            <h1>
                <span class="colorful">DNS</span>
                <span> Compare</span>
            </h1>
            <p class="description">
                <span>Compare A/AAAA DNS record in your browser by </span>
                <a href="https://developers.google.com/speed/public-dns/docs/doh/json" target="_blank">DoH JSON API.</a>
            </p>
            <${Input} value=${name} onChange=${handleNameChange} onEnter=${queryDns} />
            <${Type} value=${type} groups=${groups} onChange=${handleTypeChange} />
            ${loading && html`<${Loading} />`}
            <${Result} groups=${groups} queryed=${queryed} loading=${loading} />
            <a href="https://github.com/BaffinLee/dns-compare" target="_blank" class="github-image">
                <svg t="1698749749303" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M512 12.672c-282.88 0-512 229.248-512 512 0 226.261333 146.688 418.133333 350.08 485.76 25.6 4.821333 34.986667-11.008 34.986667-24.618667 0-12.16-0.426667-44.373333-0.64-87.04-142.421333 30.890667-172.458667-68.693333-172.458667-68.693333C188.672 770.986667 155.008 755.2 155.008 755.2c-46.378667-31.744 3.584-31.104 3.584-31.104 51.413333 3.584 78.421333 52.736 78.421333 52.736 45.653333 78.293333 119.850667 55.68 149.12 42.581333 4.608-33.109333 17.792-55.68 32.426667-68.48-113.706667-12.8-233.216-56.832-233.216-253.013333 0-55.893333 19.84-101.546667 52.693333-137.386667-5.76-12.928-23.04-64.981333 4.48-135.509333 0 0 42.88-13.738667 140.8 52.48 40.96-11.392 84.48-17.024 128-17.28 43.52 0.256 87.04 5.888 128 17.28 97.28-66.218667 140.16-52.48 140.16-52.48 27.52 70.528 10.24 122.581333 5.12 135.509333 32.64 35.84 52.48 81.493333 52.48 137.386667 0 196.693333-119.68 240-233.6 252.586667 17.92 15.36 34.56 46.762667 34.56 94.72 0 68.522667-0.64 123.562667-0.64 140.202666 0 13.44 8.96 29.44 35.2 24.32C877.44 942.592 1024 750.592 1024 524.672c0-282.752-229.248-512-512-512" fill="#dddddd"></path>
                </svg>
            </a>
        </div>
    `;
}
