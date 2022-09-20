import { CloseIcon } from "@chakra-ui/icons";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, ButtonGroup, FormErrorMessage, IconButton, Input, Text, Textarea, Tooltip } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaImage } from "react-icons/fa";

// Function to get the name of the step
function GetStepName({ setStepNames, errors, register, index }) {
  return (
    <>
    <Tooltip label="Step title">
      <Input py={2} px={2} placeholder="...title, eg. prepare egg mix" isInvalid={errors.steps && errors.steps[index]?.name}
      {...register(`steps[${index}].stepName`, {required: 'Add a step title',
        onChange: (event) => setStepNames(prevState => {
          return {
            ...prevState,
            [index]: event.target.value
          }
        })
      })} />
    </Tooltip>
    {errors.steps && errors.steps[index]?.name && (
      <FormErrorMessage>
        {errors.steps[index].name?.message}
      </FormErrorMessage>
    )}
    </>
  )
}

// Function to get the action of each step in the recipe
function GetAction({ register, errors, index }) {
  return (
    <>
    <Tooltip label="What're the actions for this step of the recipe?">
      <Textarea py={2} px={2} isInvalid={errors.steps && errors.steps[index]?.action}
      placeholder="...action, eg. crack eggs into a bowl, use a fork to mix with salt and pepper"
        {...register(`steps[${index}].action`, {required: 'What\'re the actions for this step of the recipe?', 
        maxLength: {value: 280, message: 'Action must be less than 280 characters'}})} 
      />
    </Tooltip>
    {errors.steps && errors.steps[index]?.action && (
    <FormErrorMessage>
      {errors.steps[index].action?.message}
    </FormErrorMessage>)}
    </>
  )
}

// Function to get the trigger for the next step in the recipe
function GetTrigger({ register, errors, index }) {
  return (
    <>
    <Tooltip label="What triggers the next step of the recipe?">
      <Input py={2} px={2} placeholder="...trigger, eg. stir until contents are mixed well" isInvalid={errors.steps && errors.steps[index]?.trigger}
        {...register(`steps[${index}].trigger`, 
        {maxLength: {value: 140, message: 'Trigger must be less than 140 characters'}})} 
      />
    </Tooltip>
    {errors.steps && errors.steps[index]?.trigger && (
    <FormErrorMessage>
      {errors.steps[index].trigger?.message}
    </FormErrorMessage>)}
    </>
  )
}

// Function to get the meta of the step
function GetStepComments({ register, index }) {
  return (
    <>
    <Tooltip label="How does the action(s) taken in this step affect the taste?">
      <Textarea py={2} px={2} placeholder="...comments, eg. replace pepper with red chilli powder to make it spicy"
        {...register(`steps[${index}].comments`)} 
      />
    </Tooltip>
    </>
  )
}

// Function to get the image of the action
function GetActionImage({ register, index }) {
  const { ref, onChange, ...fields } = register(`steps[${index}].actionImage`)
  const [actionImageName, setActionImageName] = useState(null);
  const hiddenFileInput = useRef(null);
  const imageUpload = event => { hiddenFileInput.current?.click() }
  return (
    <>
    <IconButton icon={<FaImage />} onClick={imageUpload} mt={1} />
    <Input type='file' style={{ display: 'none'}} accept='image/jpeg, video/*' {...fields} 
      onChange={event => { 
        onChange(event)
        setActionImageName(event.target.files[0].name) 
      }}
      ref={(instance) => {
        ref(instance)
        hiddenFileInput.current = instance
      }} />
    {actionImageName && <Text>{actionImageName}</Text>}
    </>
  )
}

// Function to get the image of the trigger
function GetTriggerImage({ register, index }) {
  const { ref, onChange, ...fields } = register(`steps[${index}].triggerImage`)
  const [triggerImageName, setTriggerImageName] = useState(null);
  const hiddenFileInput = useRef(null);
  const imageUpload = event => { hiddenFileInput.current.click() }
  return (
    <>
    <IconButton icon={<FaImage />} onClick={imageUpload} mt={1} />
    <Input type='file' style={{ display: 'none'}} accept='image/jpeg, video/*' {...fields} 
      onChange={event => { 
        onChange(event)
        setTriggerImageName(event.target.files[0].name) 
      }}
      ref={(instance) => {
        ref(instance)
        hiddenFileInput.current = instance
      }} />
    {triggerImageName && <Text>{triggerImageName}</Text>}
    </>
  )
}

// Function to get the steps in the recipe
const GetSteps = ({ useFormContext, boxColor, boxTextColor }) => {
  const { register, errors } = useFormContext();
  const [numSteps, setNumSteps] = useState(1);
  const [stepNames, setStepNames] = useState([]);

  return (
    <>
    {Array.from({ length: numSteps }, (_, index) => (
      <Box w='100%'>
        <Accordion defaultIndex={[0]} allowMultiple>
          <AccordionItem>
            <>
            <h2>
              <AccordionButton bg={(errors.steps && errors.steps[index]) ? 'red.500' : boxColor}>
                <Box flex='1' textAlign='left' color={boxTextColor}>
                  {stepNames[index] ? stepNames[index] : `Step #${index+1}`}
                </Box>
                <AccordionIcon color={boxTextColor} />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              <Box>
              <Text align='center'>Step Title*</Text>
                <GetStepName 
                  setStepNames={setStepNames}
                  errors={errors}
                  register={register}
                  index={index} 
                />
              </Box>
              <Box>
                <Box>
                  <Text align='center'>Action*</Text>
                  <GetAction 
                    errors={errors}
                    register={register}
                    index={index} 
                  />
                  <GetActionImage 
                    register={register}
                    index={index} 
                  />
                </Box>
              </Box>
              <Box>
                <Box>
                  <Text align='center'>Trigger</Text>
                  <GetTrigger 
                    errors={errors}
                    register={register}
                    index={index} 
                  />
                  <GetTriggerImage 
                    register={register}
                    index={index} 
                  />
                </Box>
              </Box>
              <Box>
                <Text align='center'>Comments</Text>
                <GetStepComments 
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
      <Button onClick={() => setNumSteps(numSteps + 1)}
      border='1px'>＋ Step</Button>
      <IconButton icon={<CloseIcon boxSize={3} />} onClick={() => setNumSteps(numSteps - 1)}
      border='1px' />
    </ButtonGroup>
    </>
  )
}

export default GetSteps