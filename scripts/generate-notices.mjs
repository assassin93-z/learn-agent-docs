import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const store = path.join(root, 'node_modules', '.pnpm');
const destination = path.join(root, 'docs', 'public', 'THIRD_PARTY_NOTICES.txt');
const licenseFilename = /^(?:licen[cs]e|copying|copyright|notice)(?:[._-].*)?$/i;
const compare = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

// These packages omit a license file from their published archives. Preserve the
// complete, version-matched upstream texts instead of inferring a copyright.
const algoliaLicense = `The MIT License (MIT)

Copyright (c) 2015-present Algolia, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
const simpleIconsLicense = `# CC0 1.0 Universal

## Statement of Purpose

The laws of most jurisdictions throughout the world automatically confer exclusive Copyright and Related Rights (defined below) upon the creator and subsequent owner(s) (each and all, an “owner”) of an original work of authorship and/or a database (each, a “Work”).

Certain owners wish to permanently relinquish those rights to a Work for the purpose of contributing to a commons of creative, cultural and scientific works (“Commons”) that the public can reliably and without fear of later claims of infringement build upon, modify, incorporate in other works, reuse and redistribute as freely as possible in any form whatsoever and for any purposes, including without limitation commercial purposes. These owners may contribute to the Commons to promote the ideal of a free culture and the further production of creative, cultural and scientific works, or to gain reputation or greater distribution for their Work in part through the use and efforts of others.

For these and/or other purposes and motivations, and without any expectation of additional consideration or compensation, the person associating CC0 with a Work (the “Affirmer”), to the extent that he or she is an owner of Copyright and Related Rights in the Work, voluntarily elects to apply CC0 to the Work and publicly distribute the Work under its terms, with knowledge of his or her Copyright and Related Rights in the Work and the meaning and intended legal effect of CC0 on those rights.

1. Copyright and Related Rights. A Work made available under CC0 may be protected by copyright and related or neighboring rights (“Copyright and Related Rights”). Copyright and Related Rights include, but are not limited to, the following:
    1. the right to reproduce, adapt, distribute, perform, display, communicate, and translate a Work;
    2. moral rights retained by the original author(s) and/or performer(s);
    3. publicity and privacy rights pertaining to a person’s image or likeness depicted in a Work;
    4. rights protecting against unfair competition in regards to a Work, subject to the limitations in paragraph 4(i), below;
    5. rights protecting the extraction, dissemination, use and reuse of data in a Work;
    6. database rights (such as those arising under Directive 96/9/EC of the European Parliament and of the Council of 11 March 1996 on the legal protection of databases, and under any national implementation thereof, including any amended or successor version of such directive); and
    7. other similar, equivalent or corresponding rights throughout the world based on applicable law or treaty, and any national implementations thereof.

2. Waiver. To the greatest extent permitted by, but not in contravention of, applicable law, Affirmer hereby overtly, fully, permanently, irrevocably and unconditionally waives, abandons, and surrenders all of Affirmer’s Copyright and Related Rights and associated claims and causes of action, whether now known or unknown (including existing as well as future claims and causes of action), in the Work (i) in all territories worldwide, (ii) for the maximum duration provided by applicable law or treaty (including future time extensions), (iii) in any current or future medium and for any number of copies, and (iv) for any purpose whatsoever, including without limitation commercial, advertising or promotional purposes (the “Waiver”). Affirmer makes the Waiver for the benefit of each member of the public at large and to the detriment of Affirmer’s heirs and successors, fully intending that such Waiver shall not be subject to revocation, rescission, cancellation, termination, or any other legal or equitable action to disrupt the quiet enjoyment of the Work by the public as contemplated by Affirmer’s express Statement of Purpose.

3. Public License Fallback. Should any part of the Waiver for any reason be judged legally invalid or ineffective under applicable law, then the Waiver shall be preserved to the maximum extent permitted taking into account Affirmer’s express Statement of Purpose. In addition, to the extent the Waiver is so judged Affirmer hereby grants to each affected person a royalty-free, non transferable, non sublicensable, non exclusive, irrevocable and unconditional license to exercise Affirmer’s Copyright and Related Rights in the Work (i) in all territories worldwide, (ii) for the maximum duration provided by applicable law or treaty (including future time extensions), (iii) in any current or future medium and for any number of copies, and (iv) for any purpose whatsoever, including without limitation commercial, advertising or promotional purposes (the “License”). The License shall be deemed effective as of the date CC0 was applied by Affirmer to the Work. Should any part of the License for any reason be judged legally invalid or ineffective under applicable law, such partial invalidity or ineffectiveness shall not invalidate the remainder of the License, and in such case Affirmer hereby affirms that he or she will not (i) exercise any of his or her remaining Copyright and Related Rights in the Work or (ii) assert any associated claims and causes of action with respect to the Work, in either case contrary to Affirmer’s express Statement of Purpose.

4. Limitations and Disclaimers.
    1. No trademark or patent rights held by Affirmer are waived, abandoned, surrendered, licensed or otherwise affected by this document.
    2. Affirmer offers the Work as-is and makes no representations or warranties of any kind concerning the Work, express, implied, statutory or otherwise, including without limitation warranties of title, merchantability, fitness for a particular purpose, non infringement, or the absence of latent or other defects, accuracy, or the present or absence of errors, whether or not discoverable, all to the greatest extent permissible under applicable law.
    3. Affirmer disclaims responsibility for clearing rights of other persons that may apply to the Work or any use thereof, including without limitation any person’s Copyright and Related Rights in the Work. Further, Affirmer disclaims responsibility for obtaining any necessary consents, permissions or other rights required for any use of the Work.
    4. Affirmer understands and acknowledges that Creative Commons is not a party to this document and has no duty or obligation with respect to this CC0 or use of the Work.

For more information, please see <https://creativecommons.org/publicdomain/zero/1.0>.
`;

class NoticeError extends Error {}

function readText(filename, label) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(filename));
  } catch {
    throw new NoticeError(`Could not read ${label} as UTF-8.`);
  }
}

function readJson(filename, label) {
  try {
    return JSON.parse(readText(filename, label));
  } catch {
    throw new NoticeError(`Could not read dependency metadata for ${label}.`);
  }
}

function directories(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => compare(left.name, right.name));
}

function installedPackages() {
  const packages = new Map();
  let entries;
  try {
    entries = directories(store);
  } catch {
    throw new NoticeError('Install the locked dependencies with pnpm before generating notices.');
  }

  for (const entry of entries) {
    const modules = path.join(store, entry.name, 'node_modules');
    let children;
    try {
      children = directories(modules);
    } catch {
      continue;
    }

    for (const child of children) {
      const directory = path.join(modules, child.name);
      // pnpm's dependency links are excluded; only physical package roots count.
      const candidates = child.name.startsWith('@')
        ? directories(directory).map((scoped) => path.join(directory, scoped.name))
        : [directory];

      for (const candidate of candidates) {
        const manifest = readJson(path.join(candidate, 'package.json'), 'an installed package');
        if (
          typeof manifest.name !== 'string' ||
          !/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(manifest.name) ||
          typeof manifest.version !== 'string' ||
          !/^[a-z0-9][a-z0-9.+_-]*$/i.test(manifest.version) ||
          typeof manifest.license !== 'string'
        ) {
          throw new NoticeError('An installed dependency has invalid name, version, or license metadata.');
        }
        const id = `${manifest.name}@${manifest.version}`;
        const previous = packages.get(id);
        if (previous && previous.license !== manifest.license) {
          throw new NoticeError(`Conflicting license declarations for ${id}.`);
        }
        if (!previous) {
          packages.set(id, {
            id,
            name: manifest.name,
            version: manifest.version,
            license: manifest.license,
            directories: [candidate],
          });
        } else {
          previous.directories.push(candidate);
        }
      }
    }
  }

  if (packages.size === 0) {
    throw new NoticeError('No installed dependency packages were found.');
  }
  return new Map([...packages.entries()].sort(([left], [right]) => compare(left, right)));
}

function distributedDocuments(directory, id) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && licenseFilename.test(entry.name))
    .sort((left, right) => compare(left.name, right.name))
    .map((entry) => ({
      name: entry.name,
      source: `Published package ${id}/${entry.name}`,
      text: readText(path.join(directory, entry.name), `${id}/${entry.name}`),
    }));
}

function verifiedUpstream(id) {
  const autocomplete = new Set([
    '@algolia/autocomplete-core@1.17.7',
    '@algolia/autocomplete-plugin-algolia-insights@1.17.7',
    '@algolia/autocomplete-preset-algolia@1.17.7',
    '@algolia/autocomplete-shared@1.17.7',
  ]);
  const docsearch = new Set([
    '@docsearch/css@3.8.2',
    '@docsearch/js@3.8.2',
    '@docsearch/react@3.8.2',
  ]);
  if (autocomplete.has(id) || docsearch.has(id)) {
    return {
      name: 'LICENSE',
      source: autocomplete.has(id)
        ? 'https://raw.githubusercontent.com/algolia/autocomplete/v1.17.7/LICENSE'
        : 'https://raw.githubusercontent.com/algolia/docsearch/v3.8.2/LICENSE',
      text: algoliaLicense,
    };
  }
  if (id === '@iconify-json/simple-icons@1.2.101') {
    return {
      name: 'LICENSE.md',
      source: 'https://raw.githubusercontent.com/simple-icons/simple-icons/16.36.0/LICENSE.md',
      text: simpleIconsLicense,
    };
  }
  return undefined;
}

function completeDocuments(dependency, packages) {
  const copies = dependency.directories.map((directory) =>
    distributedDocuments(directory, dependency.id),
  );
  if (copies.some((documents) => JSON.stringify(documents) !== JSON.stringify(copies[0]))) {
    throw new NoticeError(`Different distributed license texts found for ${dependency.id}.`);
  }
  if (copies[0].length > 0) return copies[0];

  const upstream = verifiedUpstream(dependency.id);
  if (upstream) {
    if (dependency.id === '@iconify-json/simple-icons@1.2.101') {
      for (const directory of dependency.directories) {
        const info = readJson(path.join(directory, 'info.json'), dependency.id);
        if (
          info.version !== '16.36.0' ||
          info.license?.spdx !== 'CC0-1.0' ||
          info.author?.name !== 'Simple Icons Collaborators'
        ) {
          throw new NoticeError(`Upstream collection metadata changed for ${dependency.id}.`);
        }
      }
    }
    return [upstream];
  }

  // Native archives share their exact-version parent license, including the
  // parent's bundled dependency notices. Never use an unrelated parent version.
  const parentName = dependency.name.startsWith('@esbuild/')
    ? 'esbuild'
    : dependency.name.startsWith('@rollup/rollup-')
      ? 'rollup'
      : undefined;
  const parent = parentName && packages.get(`${parentName}@${dependency.version}`);
  if (parent && parent.license === dependency.license) {
    const documents = distributedDocuments(parent.directories[0], parent.id);
    if (documents.length > 0) return documents;
  }

  throw new NoticeError(`Complete license review is required for ${dependency.id}.`);
}

function assertComplete(dependency, documents) {
  const text = documents.map((document) => document.text).join('\n');
  const checks = {
    MIT: [
      /Permission is hereby granted/i,
      /copyright/i,
      /THE SOFTWARE IS PROVIDED/i,
    ],
    ISC: [
      /Permission to use, copy, modify/i,
      /copyright/i,
      /THE SOFTWARE IS PROVIDED/i,
    ],
    'BSD-2-Clause': [
      /Redistribution and use/i,
      /copyright/i,
      /THIS (?:SOFTWARE )?IS PROVIDED/i,
    ],
    'BSD-3-Clause': [
      /Redistribution and use/i,
      /copyright/i,
      /THIS (?:SOFTWARE )?IS PROVIDED/i,
    ],
    'CC0-1.0': [
      /CC0 1\.0 Universal/,
      /Public License Fallback/,
      /Limitations and Disclaimers/,
    ],
  };
  if (
    documents.some((document) => document.text.trim().length === 0) ||
    !checks[dependency.license]?.every((pattern) => pattern.test(text))
  ) {
    throw new NoticeError(`Complete license review is required for ${dependency.id} (${dependency.license}).`);
  }
}

function renderNotices(packages) {
  const sections = [
    'Third-Party Notices',
    '===================',
    '',
    'This file preserves complete license and copyright notices for all installed',
    'site dependencies, including build-time tools, as a conservative inventory.',
    'The notices apply only to the listed third-party dependencies. They do not',
    'license the authored course, its private implementation, or referenced Nami',
    'materials. No license is inferred from a dependency manifest alone.',
    '',
    'Generated offline with: node scripts/generate-notices.mjs',
    `Package/version pairs: ${packages.size}`,
    '',
  ];

  for (const dependency of packages.values()) {
    const documents = completeDocuments(dependency, packages);
    assertComplete(dependency, documents);
    sections.push(
      '='.repeat(78),
      `Package: ${dependency.id}`,
      `Declared license: ${dependency.license}`,
      '',
    );
    for (const document of documents) {
      const hash = createHash('sha256').update(document.text, 'utf8').digest('hex');
      sections.push(
        `License document: ${document.name}`,
        `Source: ${document.source}`,
        `SHA-256: ${hash}`,
        '-'.repeat(78),
        document.text + (document.text.endsWith('\n') ? '' : '\n'),
      );
    }
  }
  return sections.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
    throw new NoticeError('Usage: node scripts/generate-notices.mjs [--check]');
  }
  const packages = installedPackages();
  const expected = renderNotices(packages);
  if (args[0] === '--check') {
    if (readText(destination, 'the committed third-party notice file') !== expected) {
      throw new NoticeError(
        'Third-party notices are missing or out of date. Run pnpm notices:generate and review the diff.',
      );
    }
    console.log(`Third-party notices verified for ${packages.size} package/version pairs.`);
    return;
  }
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, expected, 'utf8');
  console.log(`Generated third-party notices for ${packages.size} package/version pairs.`);
}

try {
  main();
} catch (error) {
  console.error(
    error instanceof NoticeError
      ? error.message
      : 'Could not generate third-party notices; inspect the public dependency installation.',
  );
  process.exitCode = 1;
}

