-- This function-is installed in the first migration by editing it manually to include this CREATE OR REPLACE FUNCTION statement.

-- It needs the pgcrypto extension to function.

CREATE OR REPLACE FUNCTION NANOID(PREFIX TEXT DEFAULT 
'', SIZE INT DEFAULT 16, ALPHABET TEXT DEFAULT '0123456789abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'
) RETURNS TEXT LANGUAGE PLPGSQL VOLATILE AS $$ 
	DECLARE idBuilder text := '';
	counter int := 0;
	bytes bytea;
	alphabetIndex int;
	alphabetArray text[];
	alphabetLength int;
	mask int;
	step int;
	BEGIN alphabetArray := regexp_split_to_array(alphabet, '');
	alphabetLength := array_length(alphabetArray, 1);
	mask := (
	    2 << cast(
	        floor(
	            log(alphabetLength - 1) / log(2)
	        ) as int
	    )
	) - 1;
	step := cast(ceil(1.6 * mask * size / alphabetLength) AS int);
	while true loop bytes := gen_random_bytes(step);
	while counter < step loop alphabetIndex := (get_byte(bytes, counter) & mask) + 1;
	if alphabetIndex <= alphabetLength then idBuilder := idBuilder || alphabetArray [alphabetIndex];
	if length(idBuilder) = size then return PREFIX || idBuilder;
	end if;
	end if;
	counter := counter + 1;
	end loop;
	counter := 0;
	end loop;
	END 
$$; 
