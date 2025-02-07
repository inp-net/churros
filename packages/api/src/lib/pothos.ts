import { graphinx, type PothosTypes } from '#lib';
import type { ObjectFieldsShape } from '@pothos/core';

/**
 * A field with no backing data that holds a nested object type with subfields
 *
 * Usage:
 *
 * ```
 * fields: (t) => ({
 *  myField: nestedFields(t, 'my-module', 'MyObject', (t) => ({
 *   subfield: t.string({
 *    resolve: () => 'value',
 *   }),
 *   anotherSubfield: t.int({
 *    resolve: () => 42,
 *   }),
 * })),
 * ```
 * @param t the builder ("t" variable) you currently have
 * @param module graphinx module to annotate the object type with
 * @param name name of the object type holding your subfields
 * @param subfields definition of your subfields. A (t) => ({ ... }) function, just like you would define fields: (t) => ({ ... }) in a normal object type
 * @returns the object type
 */
export function nestedFields<
  Typename extends string,
  ParentBuilder extends PothosSchemaTypes.ObjectFieldBuilder<
    PothosSchemaTypes.ExtendDefaultTypes<PothosTypes>,
    void
  >,
  ChildBuilder extends
    | ObjectFieldsShape<PothosSchemaTypes.ExtendDefaultTypes<PothosTypes>, void>
    | undefined,
  GraphinxModule extends string,
>(t: ParentBuilder, module: GraphinxModule, name: Typename, subfields: ChildBuilder) {
  return t.field({
    // @ts-expect-error putting void 0 makes the type checker happy, but results in a null value for the field at runtime
    resolve: () => ({}),
    type: t.builder.objectRef<void>(name).implement({
      ...graphinx(module),
      fields: subfields,
    }),
  });
}
