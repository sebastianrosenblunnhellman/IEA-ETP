Migration to update survey fields:
- Remove promedio and contacto_pares_text
- Add contacto_pares_opcion, contacto_pares_otro
- Add adscripcion_teorica_cambio (Int)
- Replace valence enums with Int fields for all contingency items (1..5)
- Add valence fields for all items
- Add activities flags (no_teorico, no_formacion, no_redes) and otro_label
