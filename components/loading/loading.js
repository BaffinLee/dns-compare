import { h } from 'https://esm.sh/preact@10.18.1';
import htm from 'https://esm.sh/htm@3.1.1';

const html = htm.bind(h);

export function Loading() {
    return html`
        <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    `;
}
