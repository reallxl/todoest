const Content = ({
  selected,
  isEditing,
  title,
  titleRef,
  description,
  descriptionRef,
}) =>
  isEditing ? (
    <>
      <input
        className="h-6 w-full border-b-2 border-black bg-transparent px-2 py-1 font-bold focus:border-b-green-500 focus-visible:outline-none"
        placeholder="Enter Title..."
        defaultValue={title}
        onClick={(e) => e.stopPropagation()}
        ref={titleRef}
      />
      <textarea
        className="h-px w-full grow rounded-md border-2 border-black bg-transparent p-2 focus:border-green-500 focus-visible:outline-none"
        placeholder=""
        defaultValue={description}
        onClick={(e) => e.stopPropagation()}
        ref={descriptionRef}
      />
    </>
  ) : (
    <>
      {title && (
        <h3 className={`${selected ? '' : 'line-clamp-1'} w-full font-bold`}>
          {title}
        </h3>
      )}
      {description && (
        <p
          className={`${selected ? 'h-px grow overflow-y-scroll' : title ? 'line-clamp-2' : 'line-clamp-3'} w-full`}
        >
          {description}
        </p>
      )}
    </>
  );

export default Content;
