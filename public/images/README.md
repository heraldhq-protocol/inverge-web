# Image provenance

`auth_img.png`, `profile_img.png`, and `role_img.png` were created for the
authentication and onboarding experience with OpenAI image generation. The
Inverge project owner authored and directed the prompts; OpenAI's image model
generated the resulting files. They are used for the auth shell, the
profile-details step, and the starting-preference step respectively. Preserve
this provenance note if the files are moved or renamed.

## `ideas/` covers

The idea covers in `ideas/` are preview fixtures, vendored locally so discovery
does not depend on a third-party host at render time. They were downloaded from
Unsplash and resized to 1200px wide at JPEG quality 82. Unsplash photos are used
under the [Unsplash License](https://unsplash.com/license): free for commercial
and non-commercial use, attribution appreciated but not required.

New idea records must not depend on these files; the API's `coverImageUrl` is
the production source. Replacing a cover is a one-file change plus the matching
entry in `src/features/ideas/content/preview-covers.ts`.

| File                          | Unsplash photo id                  |
| ----------------------------- | ---------------------------------- |
| `agroroute.jpg`               | `photo-1592982537447-7440770cbfc9` |
| `campus-konekt.jpg`           | `photo-1523240795612-9a054b0db644` |
| `care-bridge.jpg`             | `photo-1573497019940-1c28c88b4f3e` |
| `crop-circle.jpg`             | `photo-1500937386664-56d1dfef3854` |
| `ecocharge-kiosks.jpg`        | `photo-1473341304170-971dccb5ac1e` |
| `farmlink-coldbox.jpg`        | `photo-1625246333195-78d9c38ad449` |
| `kitchen-collective.jpg`      | `photo-1556910103-1c02745aae4d`    |
| `market-basket.jpg`           | `photo-1542838132-92c53300491e`    |
| `naijacraft-collective.jpg`   | `photo-1556742049-0cfed4f6a45d`    |
| `skill-circle.jpg`            | `photo-1521737604893-d14cc237f11d` |
| `solarchill.jpg`              | `photo-1508514177221-188b1cf16e9d` |
| `story-foundry.jpg`           | `photo-1492724441997-5dc865305da7` |
| `studymate-ng.jpg`            | `photo-1522202176988-66273c2fd55f` |
| `sungrid-community-power.jpg` | `photo-1509391366360-2e959784a276` |
| `zippy-campus.jpg`            | `photo-1526367790999-0150786686a2` |
| `studio.jpg`                  | `photo-1511671782779-c97d3d27a1d4` |
| `team.jpg`                    | `photo-1522071820081-009f0129c71c` |

`src/features/home/components/idea-artwork.tsx` remains the fallback for any idea
without a cover, so a missing file degrades to generated artwork rather than a
broken image.
