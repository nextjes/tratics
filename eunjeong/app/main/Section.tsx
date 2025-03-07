import ClientIcon from "~/images/computer-monitor-svgrepo-com.svg?react";
import ServerIcon from "~/images/server-svgrepo-com.svg?react";

const Section = () => {
  return (
    <section className="flex justify-center items-center">
      <ClientIcon className="w-[50px]" />
      <ServerIcon className="w-[50px]" />
    </section>
  );
};

export default Section;
