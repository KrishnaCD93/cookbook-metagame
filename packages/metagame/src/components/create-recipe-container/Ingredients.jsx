import { useLazyQuery } from "@apollo/client";
import { CloseIcon } from "@chakra-ui/icons";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, ButtonGroup, Flex, FormErrorMessage, IconButton, Input, Text, Textarea, Tooltip } from "@chakra-ui/react";
import { CreatableSelect } from "chakra-react-select";
import { useEffect } from "react";
import { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { FaImage } from "react-icons/fa";
import { GET_INGREDIENTS } from "../CreateRecipeButton";

const IngredientList = ({ control, setIngredients, ingOptions, errors, index }) => {
  return (
    <>
    <Tooltip label="Name of the ingredient">
    <Controller
      name={`ingredients[${index}].name`}
      control={control}
      rules={{ required: 'Add an ingredient name' }}
      render={({ field: { onChange, value, ref } }) => (
        <CreatableSelect
          isClearable
          inputRef={ref}
          options={ingOptions}
          isInvalid={errors.ingredients && errors.ingredients[index]?.name}
          value={ingOptions.find(option => option.value === value)}
          onChange={(val) => {
            if (val) {
              onChange(val.value)
              setIngredients(prevState => {
                return {
                  ...prevState,
                  [index]: {
                    ...prevState[index],
                    name: val.value
                  }
                }
              })
            } else {
              onChange('');
            }
          }}
        />
      )}
    />
    </Tooltip>
    {errors.ingredients && errors.ingredients[index]?.name && (
      <FormErrorMessage>
        {errors.ingredients[index].name?.message}
      </FormErrorMessage>
      )}
    </>
  )
}

// Function to get the amount of ingredients
function GetIngredientAmount({ register, setIngredients, errors, index }) {
  return (
    <>
    <Tooltip label="Add the quantity of the ingredient">
      <Input py={2} px={2} placeholder="...amount, eg. 2, large" isInvalid={errors.ingredients && errors.ingredients[index]?.amount}
      {...register(`ingredients[${index}].quantity`, {required: 'Add ingredient quantity',
        onChange: (event) => {
          setIngredients(prevState => {
            return {
              ...prevState,
              [index]: {
                ...prevState[index],
                quantity: event.target.value
              }
            }
          })
        }
      })} />
    </Tooltip>
    {errors.ingredients && errors.ingredients[index]?.quantity && (
      <FormErrorMessage>
        {errors.ingredients[index].quantity?.message}
      </FormErrorMessage>
    )}
    </>
    )
}

// Function to get a picture of the ingredient
function GetIngredientImage({ register, index }) {
  const { ref, onChange, ...fields } = register(`ingredients[${index}].image`)
  const [ingredientImageName, setIngredientImageName] = useState(null);
  const hiddenFileInput = useRef(null);
  const imageUpload = event => { hiddenFileInput.current?.click() }

  return (
    <>
    <IconButton icon={<FaImage />} onClick={imageUpload} mt={1} />
    <Flex>
      <Input type='file' style={{ display: 'none'}} accept='image/jpeg' {...fields} 
        onChange={event => { 
          onChange(event)
          setIngredientImageName(event.target.files[0].name) 
        }}
        ref={(instance) => {
          ref(instance)
          hiddenFileInput.current = instance
        }} />
      {ingredientImageName && <Text>{ingredientImageName}</Text>}
    </Flex>
    </>
  )
}

// Function to get the ingredient's meta: the effect on the recipe's taste
function GetIngredientComments({ register, index }) {
  return (
    <>
    <Tooltip label="Add any comments about the ingredient">
      <Textarea py={2} px={2} placeholder="...comments, eg. Organic free roam eggs"
      {...register(`ingredients[${index}].comments`)} />
    </Tooltip>
    </>
  )
}

// Function to get the ingredients in the recipe
const GetIngredients = ({ useFormContext, boxColor, boxTextColor }) => {
  const { register, control, errors } = useFormContext();
  const [numIngredients, setNumIngredients] = useState(1);
  const [ingredients, setIngredients] = useState([{
    name: '',
    quantity: ''
  }]);
  const [ingOptions, setIngOptions] = useState([]);
  const [getIngredientList, { error, data }] = useLazyQuery(GET_INGREDIENTS);
  if (error) console.log(error);

  // Select component that filters through the list of ingredient names from the database for the input
  useEffect(() => {
    const getIngredientsList = async () => {
      await getIngredientList()
      if (data) {
        // remove duplicates and return an array of objects with the ingredient name and id
        const reducedIngredientOptions = data.ingredients.reduce((acc, cur) => {
          const x = acc.find(item => item.value === cur.name);
          if (!x) {
            return acc.concat([{ value: cur.name, label: cur.name }]);
          } else {
            return acc;
          }
        }, []);
        setIngOptions(reducedIngredientOptions);
      }
    }
    getIngredientsList()
  }, [data, getIngredientList])

  return (
    <>
    {Array.from({ length: numIngredients }, (_, index) => (
      <Box w='100%'>
        <Accordion defaultIndex={[0]} allowMultiple>
          <AccordionItem>
            <>
            <h2>
            <AccordionButton bg={(errors.ingredients && errors.ingredients[index]) ? 'red.500' : boxColor}>
              <Box flex='1' textAlign='left' color={boxTextColor}>
                {ingredients[index] ? ingredients[index].name : `Ingredient #${index+1}`}
              </Box>
              <Flex>
              {ingredients[index]?.quantity}
              <AccordionIcon />
              </Flex>
            </AccordionButton>
            </h2>
          <AccordionPanel>
            <Box>
              <Text align='center'>Name*</Text>
              <IngredientList 
                control={control} 
                setIngredients={setIngredients} 
                ingOptions={ingOptions}
                errors={errors} 
                index={index} 
              />
              <GetIngredientImage 
                register={register}
                index={index} 
              />
            </Box>
            <Box>
              <Text align='center'>Amount*</Text>
              <GetIngredientAmount 
                register={register} 
                index={index} 
                setIngredients={setIngredients} 
                errors={errors} 
              />
            </Box>
            <Box>
              <Text align='center'>Comments</Text>
              <GetIngredientComments 
                register={register}
                index={index} 
              />
            </Box>
          </AccordionPanel>
            </>
          </AccordionItem>
        </Accordion>
      </Box>
    ))}
    <ButtonGroup justifyContent="end" size="sm" w="full" spacing={2} mt={2}>
      <Button onClick={() => setNumIngredients(numIngredients + 1)}
        border='1px'>＋ Ingredient</Button>
      <IconButton icon={<CloseIcon boxSize={3} />} onClick={() => setNumIngredients(numIngredients - 1)} 
        border='1px' />
    </ButtonGroup>
    </>
  )
}

export default GetIngredients