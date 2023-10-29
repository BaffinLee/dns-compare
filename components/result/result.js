import { h } from 'https://esm.sh/preact@10.18.1';
import htm from 'https://esm.sh/htm@3.1.1';
import { DOH_JSON_SERVERS } from '../../utils/api.js';

const html = htm.bind(h);

export function Result(props) {
    const groups = props.groups.map(group => {
        return {
            ips: group[0].records.map(record => record.data),
            ttl: group[0].records[0].TTL,
            servers: group.map(item => item.server),
            paths: group[0].paths,
        };
    });

    if (props.queryed && !props.loading && !props.groups.length) {
        return html`
            <div class="results">
                <p class="empty">No DNS record found.</p>
            </div>
        `;
    }

    return html`
        <div class="results">
            ${groups.map((group, index) => html`
                <div class="result-item" key=${index}>
                    <ul class="ips">
                        ${group.ips.map(ip => html`
                            <li key=${ip}>
                                <a href=${`https://ipinfo.io/${ip}`} target="_blank">${ip}</a>
                            </li>
                        `)}
                    </ul>
                    <ul class="info">
                        <li>
                            <div class="left">TTL</div>
                            <div class="right">${group.ttl}</div>
                        </li>
                        <li>
                            <div class="left">Path</div>
                            <div class="right">
                                ${group.paths.map((item, i) => html`
                                    <span class="path-item" key=${i}>
                                        ${item.map((name, j) => html`
                                            <span key=${name}>
                                                ${(j > 0 ? html`<span>, </span>` : '')}
                                                <a target="_blank" href=${(i === group.paths.length - 1 ? 'https://ipinfo.io/' : 'https://www.whois.com/whois/') + name}>${name}</a>
                                            </span>
                                        `)}
                                    </span>
                                    ${i !== group.paths.length - 1 && html`<span class="path-join">👉</span>`}
                                `)}
                            </div>
                        </li>
                        <li>
                            <div class="left">Server</div>
                            <div class="right">
                                ${group.servers.map((item) => html`
                                    <a
                                        class="server-item"
                                        key=${item}
                                        target="_blank"
                                        href=${DOH_JSON_SERVERS[item].website}
                                        style="background-color: ${DOH_JSON_SERVERS[item].color}"
                                    >${item}</a>
                                `)}
                            </div>
                        </li>
                    </ul>
                </div>
            `)}
        </div>
    `;
}