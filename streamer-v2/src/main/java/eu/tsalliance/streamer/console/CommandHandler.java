package eu.tsalliance.streamer.console;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.reflections.Reflections;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Set;

public class CommandHandler {
    private static final Logger logger = LoggerFactory.getLogger(CommandHandler.class);

    @Getter private static final HashMap<String, Command> commands = new HashMap<>();
    
    public static void registerCommands() {
        try {
            commands.clear();
            Reflections reflections = new Reflections("eu.tsalliance.streamer.commands");
            Set<Class<? extends Command>> classSet = reflections.getSubTypesOf(Command.class);

            classSet.forEach(aClass -> {
                try {
                    Command command = aClass.getConstructor().newInstance();

                    for(String alias : command.getAliases()) {
                        commands.put(alias.toLowerCase(), command);
                    }

                    commands.put(command.getName().toLowerCase(), command);
                } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
                    e.printStackTrace();
                }
            });
        } catch (Exception ignored) {
            logger.error("registerCommands(): Failed registering commands");
        }
    }

    public static void handleCommand(String input) {
        new Thread(() -> {
            ArrayList<String> query = new ArrayList<>(Arrays.asList(input.split(" ")));
            String commandName = query.remove(0).toLowerCase();

            try {
                Command command = getCommands().get(commandName.toLowerCase());

                if(command == null) {
                    throw new NullPointerException();
                }

                command.execute(commandName, query);
            } catch (NullPointerException ignored) {
                logger.error("Command '" + input + "' not found.");
            }
        }).start();
    }
}
