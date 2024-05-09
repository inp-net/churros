/* eslint-disable @typescript-eslint/no-explicit-any */
export const flattenOjectIntoArray = (obj: any): any[] => {
  const result = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object') 
      result.push(...flattenOjectIntoArray(obj[key]));
     else 
      result.push(obj[key]);
    
  }
  return result;
};
