import { h } from 'https://esm.sh/preact@10.18.1';
import { useState, useCallback } from 'https://esm.sh/preact@10.18.1/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import { Input } from '../input/input.js';
import { Result } from '../result/result.js';
import { Type } from '../type/type.js';
import { dnsQuery } from '../../utils/api.js';
import { Loading } from '../loading/loading.js';

const html = htm.bind(h);

export function App () {
    const [name, setName] = useState('');
    const [type, setType] = useState('A');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [queryed, setQueryed] = useState(false);

    const queryDns = useCallback((newType) => {
        if (loading) return;
        setLoading(true);
        setGroups([]);
        dnsQuery(name, newType || type).then(res => {
            setLoading(false);
            setGroups(res);
            setQueryed(true);
        }).catch(err => {
            setLoading(false);
            setGroups([]);
            setQueryed(true);
            console.error(err);
        });
    }, [name, type, loading, setGroups, setLoading, setQueryed]);

    const handleNameChange = useCallback((newName) => {
        setName(newName);
    }, [setName]);

    const handleTypeChange = useCallback((newType) => {
        setType(newType);
        queryDns(newType);
    }, [setType, queryDns]);

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
        </div>
    `;
}
