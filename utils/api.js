import punycode from 'https://esm.sh/punycode@2.3.0';

export const DOH_JSON_SERVERS = {
    Cloudflare: {
        name: 'Cloudflare',
        api: 'https://1.0.0.1/dns-query',
        website: 'https://1.1.1.1',
        color: '#ffeed9',
    },
    Google: {
        name: 'Google',
        api: 'https://8.8.4.4/resolve',
        website: 'https://dns.google',
        color: '#d9e7ff',
    },
    AliDNS: {
        name: 'AliDNS',
        api: 'https://223.5.5.5/resolve',
        website: 'https://alidns.com',
        color: '#ffe4d9',
    },
    Rubyfish: {
        name: 'Rubyfish',
        api: 'https://dns.rubyfish.cn/dns-query',
        website: 'https://rubyfish.cn/dns-query',
        color: '#ffd9e7',
    },
    'DNS.SB': {
        name: 'DNS.SB',
        api: 'https://doh.dns.sb/dns-query',
        website: 'https://dns.sb/doh',
        color: '#e8d9ff',
    },
    'TWNIC': {
        name: 'TWNIC',
        api: 'https://101.101.101.101/dns-query',
        website: 'https://twnic.tw',
        color: '#f2ffd9',
    },
};

/**
 * dns query
 * @param {string} name
 * @param {string} type
 * @returns {Promise<{ records: { TTL: number, data: string }[], paths: string[], server: string }[][]>}
 */
export function dnsQuery(name, type) {
    const nameTrimed = name.replace(/\s/g, '');
    if (!nameTrimed) return Promise.resolve([]);
    const asciiName = /^[0-9a-z\-\.]+$/.test(nameTrimed) ? nameTrimed : punycode.toASCII(nameTrimed);
    const nameEncoded = encodeURIComponent(asciiName);
    return Promise.all(Object.values(DOH_JSON_SERVERS).map(async server => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            controller.abort();
        }, 5000);
        try {
            const data = await fetch(`${server.api}?name=${nameEncoded}&type=${type}`, {
                headers: {
                    accept: 'application/dns-json',
                },
                signal: controller.signal,
            }).then(res => res.json());
            clearTimeout(timer);
            return { server: server.name, data };
        } catch (err) {
            clearTimeout(timer);
            console.error(err);
            return null;
        }
    })).then(res => {
        const datas = res
            .filter(item => item && item.data.Answer && item.data.Answer.length && item.data.Question)
            .map(item => ({
                ...item,
                ...analyzeDnsAnswers(item.data.Answer, Array.isArray(item.data.Question) ? item.data.Question[0] : item.data.Question),
            }))
            .filter(item => item.records.length);
        return groupAnswers(datas);
    });
}

/**
 * get answers ip address
 * @param {{ name: string, data: string, type: number }[]} answers
 * @param {{ name: string, type: number }} question
 */
function analyzeDnsAnswers(answers, question) {
    const removeDot = (str) => str.replace(/\.$/, '');
    const map = answers.reduce((res, item) => {
        if (![1, 5, 28, 39].includes(item.type)) return res;
        const name = removeDot(item.name);
        if (!res[name]) res[name] = [];
        res[name].push(item);
        return res;
    }, {});
    let records = map[removeDot(question.name)] || [];
    const paths = [[removeDot(question.name)], records.map(item => removeDot(item.data))];
    // find all the way down to A/AAAA record
    while (records[0] && records[0].type !== 1 && records[0].type !== 28) {
        if (paths.length > 50) return [];
        records = records
            .reduce((arr, item) => {
                arr.push(...(map[removeDot(item.data)] || []))
                return arr;
            }, [])
            .filter(item => item);
        paths.push(records.map(item => removeDot(item.data)));
    }
    return { records, paths };
}

/**
 * group answers
 * @param {{ records: { data: string }[] }[]} answers
 */
function groupAnswers(answers) {
    const parents = Array(answers.length);
    const contains = (arr1, arr2) => {
        return arr2.every(item => arr1.find(i => i.data === item.data));
    };
    for (let i = 0; i < answers.length; i++) {
        for (let j = i + 1; j < answers.length; j++) {
            if (contains(answers[i].records, answers[j].records)) {
                parents[j] = i;
            } else if (contains(answers[j].records, answers[i].records)) {
                parents[i] = j;
            }
        }
    }
    const groups = Array(answers.length)
        .fill(0)
        .map((_, index) => parents[index] === undefined ? [answers[index]] : []);
    for (let k = 0; k < answers.length; k++) {
        if (parents[k] === undefined) continue;
        let m = k;
        while (parents[m] !== undefined) m = parents[m];
        groups[m].push(answers[k]);
    }
    return groups.filter(item => item.length);
}
